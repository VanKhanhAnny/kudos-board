import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT ?? 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

app.use(morgan("dev"));
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Phase 4 (planning.md Section 5 — Eric):
// app.use("/api/boards", boardsRouter);
// app.use("/api/cards", cardsRouter);
//
// Phase 4 (planning.md Section 5 — Enes):
//   - PATCH /api/cards/:id/upvote (mounted via cardsRouter)
//   - PATCH /api/cards/:id/pin    (mounted via cardsRouter)

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`backend listening on http://localhost:${PORT}`);
  console.log(`CORS origin: ${FRONTEND_ORIGIN}`);
});
