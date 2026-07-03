import jwt from "jsonwebtoken";
import { HttpError } from "./errorHandler.js";

/*
 * Reads a bearer token from the Authorization header, verifies it against
 * JWT_SECRET, and attaches the decoded payload to `req.user`.
 *
 * On any failure (missing header, malformed token, expired, invalid sig)
 * throws HttpError(401) which errorHandler turns into `{ error }`.
 *
 * Not currently used on any board/card routes — mount it selectively when
 * we want to require login for a given endpoint.
 */
export function requireAuth(req, _res, next) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Missing or malformed Authorization header");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (_err) {
    throw new HttpError(401, "Invalid or expired token");
  }
}
