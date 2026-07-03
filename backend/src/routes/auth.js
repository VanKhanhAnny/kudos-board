import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { requireFields } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { HttpError } from "../middleware/errorHandler.js";

const router = Router();

// bcrypt cost factor. 10 is the common default: ~100ms per hash on modern
// hardware — slow enough to deter brute force, fast enough not to bottleneck
// a dev API. Bump to 12 for production.
const BCRYPT_ROUNDS = 10;
const TOKEN_TTL = "7d";

function sign(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL },
  );
}

// Never leak passwordHash to the client. Every response that includes a
// User goes through this projection.
function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

/*
 * POST /auth/register
 * Body: { username, email, password }
 * Returns: { user, token }
 *
 * Uniqueness on username/email is enforced by the DB (Prisma @unique).
 * We catch Prisma's P2002 (unique-constraint violation) and translate it
 * into a friendly 409, so the frontend can render "username taken".
 */
router.post("/register", async (req, res) => {
  requireFields(req.body, ["username", "email", "password"]);
  const { username, email, password } = req.body;

  if (password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let user;
  try {
    user = await prisma.user.create({
      data: { username, email, passwordHash },
    });
  } catch (err) {
    if (err.code === "P2002") {
      // Prisma 7's P2002 meta shape varies by driver adapter. `target` may be
      // an array of column names, a string, or absent (falling back to
      // constraint name). Guess field from whatever is present, and fall
      // back to inferring from which value collided.
      const target = err.meta?.target;
      let field = Array.isArray(target) ? target[0] : target;
      if (!field) {
        if (err.meta?.constraint?.includes?.("username")) field = "username";
        else if (err.meta?.constraint?.includes?.("email")) field = "email";
      }
      throw new HttpError(409, `${field ?? "username or email"} already in use`);
    }
    throw err;
  }

  res.status(201).json({ user: publicUser(user), token: sign(user) });
});

/*
 * POST /auth/login
 * Body: { username, password }
 * Returns: { user, token }
 *
 * Deliberately returns the same 401 for "no such user" and "wrong password"
 * so attackers can't enumerate usernames.
 */
router.post("/login", async (req, res) => {
  requireFields(req.body, ["username", "password"]);
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new HttpError(401, "Invalid username or password");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "Invalid username or password");
  }

  res.json({ user: publicUser(user), token: sign(user) });
});

/*
 * GET /auth/me
 * Returns the current user based on the bearer token.
 * Used by the frontend on app boot to rehydrate the auth context from
 * a token stored in localStorage.
 */
router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    throw new HttpError(401, "User no longer exists");
  }
  res.json({ user: publicUser(user) });
});

export default router;
