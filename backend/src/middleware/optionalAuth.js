import jwt from "jsonwebtoken";

/*
 * Attach `req.user` when a valid bearer token is present; otherwise pass
 * through untouched. Never throws — a bad/missing/expired token is treated
 * the same as no token at all.
 *
 * Used on routes that anonymous users are allowed to hit but where a
 * logged-in user should be credited (e.g. POST card: anyone can create,
 * but logged-in users' cards should be tagged with their id).
 */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
  } catch (_err) {
    // Silently ignore invalid tokens on optional-auth routes.
  }
  next();
}
