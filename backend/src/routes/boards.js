import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireFields } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { HttpError } from "../middleware/errorHandler.js";

const VALID_CATEGORIES = ["CELEBRATION", "THANK_YOU", "INSPIRATION"];
const VALID_FILTERS = ["recent"];
const RECENT_LIMIT = 6;

const router = Router();

/*
 * GET /api/boards
 * Query params (all optional):
 *   category  — one of VALID_CATEGORIES
 *   filter    — "recent" (ignores category if both are set; still respects search)
 *   search    — case-insensitive substring match on title
 *   mine      — "true" restricts to boards owned by the caller (requires auth)
 *
 * No params: return everything, newest first.
 *
 * `optionalAuth` runs on every GET so we can pick up req.user when the
 * caller sent a token; we only 401 if `mine=true` was requested WITHOUT
 * a valid token attached.
 */
router.get("/", optionalAuth, async (req, res) => {
  const { category, filter, search, mine } = req.query;

  if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
    throw new HttpError(
      400,
      `Invalid query parameter: category must be one of ${VALID_CATEGORIES.join(", ")}`,
    );
  }
  if (filter !== undefined && !VALID_FILTERS.includes(filter)) {
    throw new HttpError(
      400,
      `Invalid query parameter: filter must be one of ${VALID_FILTERS.join(", ")}`,
    );
  }
  if (mine === "true" && !req.user) {
    throw new HttpError(401, "Must be logged in to view your boards");
  }

  const where = {};
  if (filter !== "recent" && category) {
    where.category = category;
  }
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (mine === "true") {
    where.authorId = req.user.id;
  }

  const boards = await prisma.board.findMany({
    where,
    orderBy: { createdAt: "desc" },
    ...(filter === "recent" ? { take: RECENT_LIMIT } : {}),
  });

  res.json(boards);
});

/*
 * POST /api/boards
 * Body: { title, category, imageUrl, author? }
 * All three non-author fields are required (see planning.md §2, §3).
 * Requires auth: the created row is stamped with req.user.id so we can
 * enforce ownership on delete and support the "my boards" filter.
 */
router.post("/", requireAuth, async (req, res) => {
  requireFields(req.body, ["title", "category", "imageUrl"]);
  const { title, category, imageUrl, author } = req.body;

  if (!VALID_CATEGORIES.includes(category)) {
    throw new HttpError(
      400,
      `category must be one of ${VALID_CATEGORIES.join(", ")}`,
    );
  }

  const board = await prisma.board.create({
    data: {
      title,
      category,
      imageUrl,
      author: author ?? null,
      authorId: req.user.id,
    },
  });

  res.status(201).json(board);
});

/*
 * GET /api/boards/:id
 * Returns the board with its cards attached (BoardPage renders both).
 * 404 if no board with that id.
 */
router.get("/:id", async (req, res) => {
  const board = await prisma.board.findUnique({
    where: { id: req.params.id },
    include: { cards: true },
  });

  if (!board) {
    throw new HttpError(404, "Board not found");
  }

  res.json(board);
});

/*
 * DELETE /api/boards/:id
 * Cards cascade-delete via the FK (see schema.prisma).
 * Rules (per user-ownership-scope plan):
 *   - Must be logged in.
 *   - Owned board: only the owner may delete.
 *   - Orphan board (authorId === null): any logged-in user may delete.
 * We fetch first to enforce ownership; that fetch also gives us the 404
 * for free instead of letting Prisma's P2025 bubble up.
 */
router.delete("/:id", requireAuth, async (req, res) => {
  const board = await prisma.board.findUnique({
    where: { id: req.params.id },
    select: { id: true, authorId: true },
  });
  if (!board) {
    throw new HttpError(404, "Board not found");
  }
  if (board.authorId && board.authorId !== req.user.id) {
    throw new HttpError(403, "You do not own this board");
  }

  await prisma.board.delete({ where: { id: board.id } });
  res.status(204).end();
});

export default router;
