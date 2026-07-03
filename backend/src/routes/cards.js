import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireFields } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { HttpError } from "../middleware/errorHandler.js";

/*
 * Cards router. Exports a Router with mergeParams:true so that req.params.boardId
 * is visible when index.js mounts this under /api/boards/:boardId/cards. The same
 * router is also mounted at /api/cards for the id-based routes. Inside here the
 * card id is always :id and the mount path decides which routes are reachable.
 */
const router = Router({ mergeParams: true });

/*
 * POST /api/boards/:boardId/cards
 * Body: { title, message, gifUrl, author? }
 * The three non-author fields are required (see planning.md §2, §3).
 *
 * Uses optionalAuth: anyone can create a card (anonymous cards are allowed),
 * but if a valid token is present the card is credited to that user via
 * authorId — used later for ownership-scoped delete.
 *
 * 404 if the parent board does not exist: Prisma raises P2003 (foreign key
 * violation) on create, which we translate into a 404 rather than a 500.
 */
router.post("/", optionalAuth, async (req, res) => {
  requireFields(req.body, ["title", "message", "gifUrl"]);
  const { title, message, gifUrl, author } = req.body;

  try {
    const card = await prisma.card.create({
      data: {
        title,
        message,
        gifUrl,
        author: author ?? null,
        boardId: req.params.boardId,
        authorId: req.user?.id ?? null,
      },
    });
    res.status(201).json(card);
  } catch (err) {
    if (err && err.code === "P2003") {
      throw new HttpError(404, "Board not found");
    }
    throw err;
  }
});

/*
 * DELETE /api/cards/:id
 * Same ownership rules as DELETE /api/boards/:id:
 *   - Must be logged in.
 *   - Owned card: only the owner may delete.
 *   - Orphan card (authorId === null): any logged-in user may delete.
 */
router.delete("/:id", requireAuth, async (req, res) => {
  const card = await prisma.card.findUnique({
    where: { id: req.params.id },
    select: { id: true, authorId: true },
  });
  if (!card) {
    throw new HttpError(404, "Card not found");
  }
  if (card.authorId && card.authorId !== req.user.id) {
    throw new HttpError(403, "You do not own this card");
  }

  await prisma.card.delete({ where: { id: card.id } });
  res.status(204).end();
});

/*
 * PATCH /api/cards/:id/upvote
 * Increments upvotes by 1 and returns the updated card. A missing card makes
 * the update throw P2025 → 404 via the error handler, so no explicit fetch.
 */
router.patch("/:id/upvote", async (req, res) => {
  const updated = await prisma.card.update({
    where: { id: req.params.id },
    data: { upvotes: { increment: 1 } },
  });
  res.json(updated);
});

export default router;
