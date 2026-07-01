/*
 * Centralized error handler.
 *
 * Three classes of error this knows how to handle:
 *   1. Errors thrown by route handlers with a `.status` and `.message` (intentional 400/404 etc.)
 *   2. Prisma errors — currently just P2025 (record not found) → 404
 *   3. Anything else → 500 with a generic message (real error is logged server-side)
 *
 * Response shape always matches the contract in planning.md Section 2:
 *   `{ "error": "human-readable message" }`
 */
export function errorHandler(err, req, res, _next) {
  if (err && typeof err.status === "number" && err.status >= 400 && err.status < 600) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err && err.code === "P2025") {
    return res.status(404).json({ error: "Not found" });
  }

  console.error("[unhandled]", req.method, req.path, err);
  return res.status(500).json({ error: "Internal server error" });
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
