import { HttpError } from "./errorHandler.js";

/*
 * Throws an HttpError(400) if any of `required` keys are missing or blank on `body`.
 * Used by route handlers before hitting Prisma. Enes will reuse this for his
 * PATCH routes too (per planning.md Section 5).
 *
 * Example:
 *   requireFields(req.body, ["title", "category"]);
 */
export function requireFields(body, required) {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Request body must be a JSON object");
  }
  for (const key of required) {
    const value = body[key];
    if (value === undefined || value === null || value === "") {
      throw new HttpError(400, `${key} is required`);
    }
  }
}
