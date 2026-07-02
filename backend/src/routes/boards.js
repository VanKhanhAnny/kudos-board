import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireFields } from "../middleware/validate.js";
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
 *
 * No params: return everything, newest first.
 */
router.get("/", async (req, res) => {
  const { category, filter, search } = req.query;

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

  const where = {};
  if (filter !== "recent" && category) {
    where.category = category;
  }
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
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
 */
router.post("/", async (req, res) => {
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
 * If the board doesn't exist Prisma throws P2025, which the centralized
 * errorHandler translates into a 404 — no explicit fetch-then-check needed.
 */
router.delete("/:id", async (req, res) => {
  await prisma.board.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
