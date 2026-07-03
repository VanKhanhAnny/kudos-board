# Kudos Board — Project Specification

This document is the spec the rest of the project implements against. Scope: all CORE features from `README.md` plus User Accounts. Comments and Dark Mode are out of scope. Pinned Cards was in scope originally — the backend was built and later removed. User Accounts was originally out of scope and was added afterwards. See the two "Spec change" notes below for both.

**Stack:** Vite + React + React Router (frontend), Express + Prisma + PostgreSQL (backend), GIPHY API (external).

---

## Section 1: Component Architecture

### Hierarchy

```
App
└── ThemeProvider (Context: dark mode)
    └── BrowserRouter
        ├── Header                       (rendered on every route)
        │   └── DarkModeToggle
        ├── Routes
        │   ├── "/"           → HomePage
        │   │                    ├── Banner
        │   │                    ├── SearchBar
        │   │                    ├── CategoryFilter
        │   │                    ├── CreateBoardModal       (conditional)
        │   │                    └── BoardGrid
        │   │                        └── BoardCard          (× N)
        │   └── "/boards/:boardId" → BoardPage
        │                            ├── BoardPageHeader
        │                            ├── CreateCardModal    (conditional)
        │                            │   └── GiphySearch
        │                            └── CardGrid
        │                                └── CardTile        (× N)
        └── Footer                       (rendered on every route)
```

### Components

#### `App`
- **Responsibility:** Top-level shell. Wires up theme context and routing.
- **Renders:** `ThemeProvider` wrapping `BrowserRouter` with `Header`, `Routes`, `Footer`.
- **Props:** none.
- **State:** none.
- **Interactions:** none directly.

#### `ThemeProvider`
- **Responsibility:** Owns the dark-mode value and exposes it via React Context. Persists to `localStorage`.
- **Renders:** `<ThemeContext.Provider>` wrapping `children`.
- **Props:** `children`.
- **State:** `theme: "light" | "dark"` (initial value read from `localStorage`, default `"light"`).
- **Interactions:** Provides `toggleTheme()` to descendants; writes to `localStorage` on change.

#### `Header`
- **Responsibility:** Site-wide top navigation. Contains app title/logo and dark mode toggle.
- **Renders:** App title (link to `/`), `DarkModeToggle`.
- **Props:** none.
- **State:** none.
- **Interactions:** Title click navigates to `/`.

#### `DarkModeToggle`
- **Responsibility:** Button that flips theme between light and dark.
- **Renders:** A button with sun/moon icon.
- **Props:** none (reads from `ThemeContext`).
- **State:** none.
- **Interactions:** `onClick` → calls `toggleTheme()` from context.

#### `Footer`
- **Responsibility:** Site-wide footer (attribution, copyright).
- **Renders:** Static text.
- **Props:** none.
- **State:** none.
- **Interactions:** none.

#### `HomePage`
- **Responsibility:** Composes the boards browsing experience: banner, search, filter, grid, create-board entry point. Fetches and owns the board list.
- **Renders:** `Banner`, `SearchBar`, `CategoryFilter`, "Create Board" button, conditional `CreateBoardModal`, `BoardGrid`.
- **Props:** none (route component).
- **State:**
  - `boards: Board[]`
  - `selectedCategory: "all" | "recent" | "CELEBRATION" | "THANK_YOU" | "INSPIRATION"`
  - `searchQuery: string` (committed query — distinct from the input field's local value)
  - `isCreateBoardModalOpen: boolean`
- **Interactions:**
  - On mount and whenever `selectedCategory` or `searchQuery` changes → fetch `GET /api/boards` with query params.
  - "Create Board" click → opens modal.
  - Board successfully created → close modal, prepend to `boards`.
  - Board successfully deleted → remove from `boards`.

#### `Banner`
- **Responsibility:** Visual hero/banner shown at top of home page.
- **Renders:** Static image and headline text.
- **Props:** none.
- **State:** none.
- **Interactions:** none.

#### `SearchBar`
- **Responsibility:** Input field for searching boards by title; submits or clears the search.
- **Renders:** `<input>`, Search button, Clear button.
- **Props:** `onSearch(query: string)`, `onClear()`.
- **State:** `inputValue: string` (local controlled-input value).
- **Interactions:**
  - User types → updates `inputValue`.
  - Submit button click OR Enter key → calls `onSearch(inputValue)`.
  - Clear button click OR `inputValue` cleared to empty → calls `onClear()`.

#### `CategoryFilter`
- **Responsibility:** Renders the category buttons/tabs and reports selection to parent.
- **Renders:** Buttons for: All, Recent, Celebration, Thank You, Inspiration.
- **Props:** `selectedCategory`, `onSelectCategory(category)`.
- **State:** none.
- **Interactions:** Button click → `onSelectCategory(category)`.

#### `BoardGrid`
- **Responsibility:** Lays out a list of boards in a responsive grid; shows an empty state when none.
- **Renders:** A grid of `BoardCard` components, or an empty-state message.
- **Props:** `boards: Board[]`, `onDeleteBoard(boardId)`.
- **State:** none.
- **Interactions:** none directly (delegates to `BoardCard`).

#### `BoardCard`
- **Responsibility:** Single board tile in the grid. Shows title + image, supports navigation and deletion.
- **Renders:** Image, board title, category label, optional author, Delete button, wrapped in a `<Link>`.
- **Props:** `board: Board`, `onDelete(boardId)`.
- **State:** none.
- **Interactions:**
  - Card click → navigate to `/boards/:id`.
  - Delete button click → confirm, then call `onDelete(board.id)` (which triggers `DELETE /api/boards/:id` in parent).

#### `BoardPage`
- **Responsibility:** Single board detail page. Fetches and owns the cards list for one board.
- **Renders:** `BoardPageHeader`, "Create Card" button, conditional `CreateCardModal`, `CardGrid`.
- **Props:** none (route component; reads `:boardId` from URL params).
- **State:**
  - `board: Board | null` (with category, title, etc.)
  - `cards: Card[]`
  - `isCreateCardModalOpen: boolean`
- **Interactions:**
  - On mount or when `boardId` changes → fetch `GET /api/boards/:id` (returns board + cards).
  - "Create Card" click → opens modal.
  - Card created → prepend to `cards`, close modal.
  - Card deleted → remove from `cards`.
  - Card upvoted → update that card's `upvotes` in `cards`.

#### `BoardPageHeader`
- **Responsibility:** Shows board title, category, author, and a back link.
- **Renders:** Heading text, category badge, author (if present), back-to-home link.
- **Props:** `board: Board`.
- **State:** none.
- **Interactions:** Back link → navigate to `/`.

#### `CardGrid`
- **Responsibility:** Lays out cards in a grid, ordered by `createdAt` descending.
- **Renders:** A grid of `CardTile` components, or an empty-state message.
- **Props:** `cards: Card[]`, `onUpvote(cardId)`, `onDelete(cardId)`.
- **State:** none.
- **Interactions:** none directly (delegates to `CardTile`).

#### `CardTile`
- **Responsibility:** Single card display with title, message, gif, upvote count, delete button.
- **Renders:** Gif image, title heading, message text, optional author, upvote button + count, delete button.
- **Props:** `card: Card`, `onUpvote(cardId)`, `onDelete(cardId)`.
- **State:** none.
- **Interactions:**
  - Upvote click → `onUpvote(card.id)`.
  - Delete click → confirm, then `onDelete(card.id)`.

#### `CreateBoardModal`
- **Responsibility:** Modal containing a form to create a new board.
- **Renders:** Backdrop, modal container, form with title input, category select, author input (optional), Submit and Cancel buttons.
- **Props:** `isOpen: boolean`, `onClose()`, `onBoardCreated(board)`.
- **State:**
  - `title: string`
  - `category: Category` (default `"CELEBRATION"`)
  - `author: string`
  - `isSubmitting: boolean`
  - `errorMessage: string | null`
- **Interactions:**
  - Form submit → `POST /api/boards`, on success call `onBoardCreated(newBoard)` then `onClose()`.
  - Cancel or backdrop click → `onClose()`.

#### `CreateCardModal`
- **Responsibility:** Modal containing a form to create a new card on the current board.
- **Renders:** Backdrop, form with title input, message textarea, author input (optional), `GiphySearch`, Submit and Cancel buttons.
- **Props:** `isOpen: boolean`, `boardId: string`, `onClose()`, `onCardCreated(card)`.
- **State:**
  - `title: string`
  - `message: string`
  - `author: string`
  - `selectedGifUrl: string | null`
  - `isSubmitting: boolean`
  - `errorMessage: string | null`
- **Interactions:**
  - Form submit (only enabled when `title`, `message`, and `selectedGifUrl` are set) → `POST /api/boards/:boardId/cards`, on success call `onCardCreated(newCard)` then `onClose()`.
  - Cancel → `onClose()`.

#### `GiphySearch`
- **Responsibility:** Search-and-select widget that queries the GIPHY API and lets the user pick a gif.
- **Renders:** Search input, results grid, currently-selected gif preview.
- **Props:** `selectedGifUrl: string | null`, `onSelectGif(url)`.
- **State:**
  - `gifQuery: string`
  - `gifResults: GiphyResult[]`
  - `isLoading: boolean`
- **Interactions:**
  - User types and submits → fetch GIPHY search API directly from the browser at `https://api.giphy.com/v1/gifs/search`, using `VITE_GIPHY_API_KEY` from `frontend/.env`. No backend proxy.
  - Click on a result → `onSelectGif(url)`.

---

## Section 2: API Contracts

All routes are prefixed with `/api`. All responses are JSON. All request bodies are JSON.

### `GET /api/boards`

List boards, with optional filtering and search.

- **Query params (all optional):**
  - `category`: `"CELEBRATION" | "THANK_YOU" | "INSPIRATION"` — return only boards in this category.
  - `filter`: `"recent"` — return only the 6 most recently created boards (ignores `category` if both set).
  - `search`: string — case-insensitive substring match on `title`.
- **Success — 200 OK:**
  ```json
  [
    {
      "id": "uuid",
      "title": "string",
      "category": "CELEBRATION",
      "author": "string | null",
      "imageUrl": "string",
      "createdAt": "2026-06-26T19:00:00.000Z"
    }
  ]
  ```
- **Errors:**
  - `400 Bad Request` — invalid `category` or `filter` value. Body: `{ "error": "Invalid query parameter: ..." }`
  - `500 Internal Server Error` — database failure.

### `POST /api/boards`

Create a new board.

- **Request body:**
  ```json
  {
    "title": "string (required, 1-100 chars)",
    "category": "CELEBRATION | THANK_YOU | INSPIRATION (required)",
    "imageUrl": "string (required, valid URL)",
    "author": "string (optional, max 50 chars)"
  }
  ```
- **Success — 201 Created:**
  ```json
  {
    "id": "uuid",
    "title": "...",
    "category": "...",
    "author": "... | null",
    "imageUrl": "string",
    "createdAt": "..."
  }
  ```
- **Errors:**
  - `400 Bad Request` — missing/invalid `title`, `category`, or `imageUrl`. Body: `{ "error": "title is required" }` (or similar).
  - `500 Internal Server Error`.

### `GET /api/boards/:id`

Get a single board with its cards (used by Board Page).

- **Success — 200 OK:**
  ```json
  {
    "id": "uuid",
    "title": "...",
    "category": "...",
    "author": "... | null",
    "imageUrl": "string",
    "createdAt": "...",
    "cards": [
      {
        "id": "uuid",
        "title": "...",
        "message": "...",
        "gifUrl": "...",
        "author": "... | null",
        "upvotes": 0,
        "createdAt": "...",
        "boardId": "uuid"
      }
    ]
  }
  ```
- **Errors:**
  - `404 Not Found` — no board with that id. Body: `{ "error": "Board not found" }`.
  - `500 Internal Server Error`.

### `DELETE /api/boards/:id`

Delete a board (cascade-deletes its cards).

- **Success — 204 No Content** (empty body).
- **Errors:**
  - `404 Not Found` — board does not exist.
  - `500 Internal Server Error`.

### `POST /api/boards/:boardId/cards`

Create a new card on a board.

- **Request body:**
  ```json
  {
    "title": "string (required, 1-100 chars)",
    "message": "string (required, 1-500 chars)",
    "gifUrl": "string (required, valid URL)",
    "author": "string (optional, max 50 chars)"
  }
  ```
- **Success — 201 Created:**
  ```json
  {
    "id": "uuid",
    "title": "...",
    "message": "...",
    "gifUrl": "...",
    "author": "... | null",
    "upvotes": 0,
    "createdAt": "...",
    "boardId": "uuid"
  }
  ```
- **Errors:**
  - `400 Bad Request` — missing/invalid `title`, `message`, or `gifUrl`.
  - `404 Not Found` — parent board does not exist.
  - `500 Internal Server Error`.

### `DELETE /api/cards/:id`

Delete a card.

- **Success — 204 No Content**.
- **Errors:**
  - `404 Not Found` — card does not exist.
  - `500 Internal Server Error`.

### `PATCH /api/cards/:id/upvote`

Increment a card's upvote count by 1.

- **Request body:** none (or empty `{}`).
- **Success — 200 OK:** returns the updated card (same shape as in `GET /boards/:id`).
- **Errors:**
  - `404 Not Found` — card does not exist.
  - `500 Internal Server Error`.

### Cross-cutting

- All 4xx/5xx responses use a uniform shape: `{ "error": "human-readable message" }`.
- CORS allows the frontend origin (configured via `FRONTEND_ORIGIN` env var).
- GIPHY is called **directly from the frontend**; the backend exposes no GIPHY endpoint. The free-tier GIPHY developer key is intended for client-side use, so the frontend reads it from `VITE_GIPHY_API_KEY` and calls `https://api.giphy.com/v1/gifs/search` directly. See Section 1 `GiphySearch` and Section 5 Frontend ownership.

---

## Section 3: Database Schema Spec

Target: PostgreSQL via Prisma. The eventual `backend/prisma/schema.prisma` should match what's described here. If a field changes during implementation, update this section too.

### Enum: `Category`

```
CELEBRATION
THANK_YOU
INSPIRATION
```

### Model: `Board`

| Field       | Type       | Required | Default | Notes                                         |
|-------------|------------|----------|---------|-----------------------------------------------|
| `id`        | String     | yes      | `cuid()`| Primary key.                                  |
| `title`     | String     | yes      | —       | 1–100 chars (validated in API layer).         |
| `category`  | `Category` | yes      | —       | Enum above.                                   |
| `author`    | String?    | no       | `null`  | Optional creator display name.                |
| `imageUrl`  | String     | yes      | —       | Required in DB and in the `POST /api/boards` request body. Frontend supplies the URL (the "Create Board" form has an image field). |
| `createdAt` | DateTime   | yes      | `now()` | Used for "Recent" filter and grid ordering.   |
| `cards`     | `Card[]`   | —        | —       | Relation: one Board has many Cards.           |

### Model: `Card`

| Field       | Type     | Required | Default | Notes                                          |
|-------------|----------|----------|---------|------------------------------------------------|
| `id`        | String   | yes      | `cuid()`| Primary key.                                   |
| `title`     | String   | yes      | —       | 1–100 chars (validated in API layer). Rendered as the card headline in `CardTile`. |
| `message`   | String   | yes      | —       | 1–500 chars (validated in API layer).          |
| `gifUrl`    | String   | yes      | —       | GIPHY URL chosen by the user.                  |
| `author`    | String?  | no       | `null`  | Optional creator display name.                 |
| `upvotes`   | Int      | yes      | `0`     | Incremented by upvote endpoint.                |
| `createdAt` | DateTime | yes      | `now()` | Used for default ordering.                     |
| `boardId`   | String   | yes      | —       | Foreign key → `Board.id`.                      |
| `board`     | `Board`  | —        | —       | Relation: `@relation(fields: [boardId], references: [id], onDelete: Cascade)`. Deleting a board deletes its cards. |

### Relationships

- `Board 1 ── * Card` (one board has many cards; a card belongs to exactly one board).
- Cascade delete on `Board → Card`: deleting a board removes all its cards via the FK's `onDelete: Cascade`.

### Indexing notes (for later)

- `Card.boardId` is automatically indexed by Prisma (FK).
- Consider adding indexes on `Board.category` and `Board.createdAt` once the dataset grows — not required at the spec stage.

---

## Section 4: State Architecture

State lives as close to where it's used as possible. The only global state is the dark-mode theme, which uses React Context. Server data is fetched in the page components that need it; there is no global store.

### `ThemeProvider` (Context — global)

| State variable | Type                   | Initial value                                              | Owner            | Update trigger                                            |
|----------------|------------------------|------------------------------------------------------------|------------------|-----------------------------------------------------------|
| `theme`        | `"light" \| "dark"`    | `localStorage.getItem("theme") ?? "light"`                 | `ThemeProvider`  | `DarkModeToggle` click → `toggleTheme()` flips and persists to `localStorage`. |

### `HomePage`

| State variable           | Type                                                                                | Initial value | Owner       | Update trigger                                                              |
|--------------------------|-------------------------------------------------------------------------------------|---------------|-------------|-----------------------------------------------------------------------------|
| `boards`                 | `Board[]`                                                                           | `[]`          | `HomePage`  | Fetched on mount and whenever `selectedCategory` or `searchQuery` changes; also mutated by create/delete callbacks. |
| `selectedCategory`       | `"all" \| "recent" \| "CELEBRATION" \| "THANK_YOU" \| "INSPIRATION"`                | `"all"`       | `HomePage`  | `CategoryFilter` button click.                                              |
| `searchQuery`            | `string`                                                                            | `""`          | `HomePage`  | `SearchBar` submit (button click or Enter); `SearchBar` clear sets it to `""`. |
| `isCreateBoardModalOpen` | `boolean`                                                                           | `false`       | `HomePage`  | "Create Board" button click (open); modal close button or successful create (close). |

### `SearchBar`

| State variable | Type     | Initial value | Owner       | Update trigger                                |
|----------------|----------|---------------|-------------|-----------------------------------------------|
| `inputValue`   | `string` | `""`          | `SearchBar` | Every keystroke (controlled input).           |

Note: `inputValue` is the *uncommitted* input field value. It only becomes the committed `searchQuery` on submit. This is what lets the user type without triggering a fetch on every keystroke.

### `CreateBoardModal`

| State variable   | Type                                              | Initial value     | Owner              | Update trigger                                  |
|------------------|---------------------------------------------------|-------------------|--------------------|-------------------------------------------------|
| `title`          | `string`                                          | `""`              | `CreateBoardModal` | Every keystroke in title input.                 |
| `category`       | `"CELEBRATION" \| "THANK_YOU" \| "INSPIRATION"`   | `"CELEBRATION"`   | `CreateBoardModal` | Category select change.                         |
| `author`         | `string`                                          | `""`              | `CreateBoardModal` | Every keystroke in author input.                |
| `isSubmitting`   | `boolean`                                         | `false`           | `CreateBoardModal` | `true` on form submit; `false` after response.  |
| `errorMessage`   | `string \| null`                                  | `null`            | `CreateBoardModal` | Set on API error response; cleared on retry.    |

### `BoardPage`

| State variable          | Type            | Initial value | Owner       | Update trigger                                                              |
|-------------------------|-----------------|---------------|-------------|-----------------------------------------------------------------------------|
| `board`                 | `Board \| null` | `null`        | `BoardPage` | Fetched on mount / when `boardId` URL param changes.                        |
| `cards`                 | `Card[]`        | `[]`          | `BoardPage` | Set from initial fetch; mutated by create/delete/upvote callbacks.          |
| `isCreateCardModalOpen` | `boolean`       | `false`       | `BoardPage` | "Create Card" button click (open); modal close or successful create (close).|

### `CreateCardModal`

| State variable    | Type             | Initial value | Owner             | Update trigger                                  |
|-------------------|------------------|---------------|-------------------|-------------------------------------------------|
| `title`           | `string`         | `""`          | `CreateCardModal` | Every keystroke in title input.                 |
| `message`         | `string`         | `""`          | `CreateCardModal` | Every keystroke in message textarea.            |
| `author`          | `string`         | `""`          | `CreateCardModal` | Every keystroke in author input.                |
| `selectedGifUrl`  | `string \| null` | `null`        | `CreateCardModal` | `GiphySearch` calls `onSelectGif(url)`.         |
| `isSubmitting`    | `boolean`        | `false`       | `CreateCardModal` | `true` on submit; `false` after response.       |
| `errorMessage`    | `string \| null` | `null`        | `CreateCardModal` | Set on API error response; cleared on retry.    |

### `GiphySearch`

| State variable | Type             | Initial value | Owner         | Update trigger                                    |
|----------------|------------------|---------------|---------------|---------------------------------------------------|
| `gifQuery`     | `string`         | `""`          | `GiphySearch` | Every keystroke in search input.                  |
| `gifResults`   | `GiphyResult[]`  | `[]`          | `GiphySearch` | Set after GIPHY API responds; cleared on new search. |
| `isLoading`    | `boolean`        | `false`       | `GiphySearch` | `true` while GIPHY request is in flight.          |

### Derived (not stored as state)

- **Sorted card list** in `CardGrid`: derived inside render from `cards` prop. Ordered by `createdAt` descending.
- **Filtered/searched board list**: NOT derived on the frontend. Filtering and search are pushed to the backend via `GET /api/boards` query params, so what comes back is already the right set.

---

## Section 5: Work Allocation

This section assigns concrete ownership for every artifact in the project. Sections 1–4 are the *integration contract* — what gets built. This section is the *team contract* — who builds what, and how we avoid stepping on each other.

### Roles

- **Anny** — Frontend Lead (Milestone 1). Currently in Figma design phase; will translate to code once mockups are settled.
- **Eric** (me) — Backend co-owner (foundation + boards routes) (Milestone 2). Owns project scaffolding, schema, shared middleware, and the four board endpoints.
- **Enes** — Backend co-owner (cards routes) (Milestone 2). Owns all four card endpoints, working in parallel with Eric once foundation is merged.
- **Milestone 3 (integration)** — Anny + Eric drive; Enes assists if needed.

### Frontend ownership — Anny

Anny owns the entire frontend deliverable. From Sections 1 and 4, that includes:

**Components (all 14 from Section 1):**
- `App`, `ThemeProvider`, `Header`, `DarkModeToggle`, `Footer`
- `HomePage`, `Banner`, `SearchBar`, `CategoryFilter`, `BoardGrid`, `BoardCard`, `CreateBoardModal`
- `BoardPage`, `BoardPageHeader`, `CardGrid`, `CardTile`, `CreateCardModal`, `GiphySearch`

**Infrastructure:**
- Vite project init in `frontend/` (`npm create vite@latest`)
- React Router setup (`BrowserRouter`, route config for `/` and `/boards/:boardId`)
- Styling solution of her choice (CSS modules, Tailwind, etc.)
- GIPHY API integration in `GiphySearch` — direct browser call to `https://api.giphy.com/v1/gifs/search` using `VITE_GIPHY_API_KEY` from `frontend/.env`. Anny registers for a free GIPHY developer key at developers.giphy.com.

**State (per Section 4):**
- Everything: page-level state (`HomePage`, `BoardPage`), modal state (`CreateBoardModal`, `CreateCardModal`), `SearchBar.inputValue`, `GiphySearch` state, `ThemeProvider` Context

**Deliverables in planning.md:**
- Writes the `Decisions Log — Frontend (Milestone 1)` section once frontend is done (template lives in `guide.md`).

**Coordination notes (from Anny's frontend summary, Jun 30):**
- Backend will run on `http://localhost:3000`. When wiring up real fetch calls in Milestone 3, Anny should set `VITE_API_BASE_URL=http://localhost:3000` in `frontend/.env` and read it via `import.meta.env.VITE_API_BASE_URL`.
- Anny's `Header` component shows **log in / register buttons that intentionally aren't wired**. User Accounts is out of scope for this version of the spec; the backend will not provide `/api/auth/*` endpoints. The buttons stay visible as visual placeholders — they're deliberately no-ops.
- Vite's default dev port is `5173`. The backend's CORS middleware allows that origin via the `FRONTEND_ORIGIN` env var; if Anny ever runs Vite on a non-default port, update both `.env` files.
- Anny's `mockBoards` currently has shape `{ id, title, imageUrl }` — this is a strict subset of what `GET /api/boards` returns. She'll need `category` (for the nav tabs to filter) and `createdAt` (for the Recent tab) when she wires the real endpoint.

### Backend ownership — Eric (~50%)

Eric owns the foundation everyone else builds on, plus the 4 board endpoints.

**Foundation (shared infrastructure, must land before Enes can start):**
- `cd backend && npm init -y`
- Install `express`, `@prisma/client`, `cors`, `dotenv`; dev-install `prisma`
- `npx prisma init` → generates `backend/prisma/schema.prisma`
- Implement `schema.prisma` from the Section 3 spec verbatim
- First migration: `npx prisma migrate dev --name init`
- `backend/src/index.js` — Express bootstrap, JSON body parser, CORS middleware reading `FRONTEND_ORIGIN` from env
- Shared middleware: centralized error handler, request-body validation helpers (Enes reuses these on his card routes)
- `backend/.env.example` documenting `DATABASE_URL`, `FRONTEND_ORIGIN`, `PORT`

**Endpoints (4 of 8) — all in `backend/src/routes/boards.js`:**

| Method | Path                                | Notes                                          |
|--------|-------------------------------------|------------------------------------------------|
| GET    | `/api/boards`                       | Supports `category`, `filter=recent`, `search` query params |
| POST   | `/api/boards`                       | Validates `title` + `category` required        |
| GET    | `/api/boards/:id`                   | Uses Prisma `include: { cards: true }`         |
| DELETE | `/api/boards/:id`                   | Cascade via FK `onDelete: Cascade`             |

**Testing:** Postman/Insomnia collection covering all 4 board endpoints with happy-path + 400/404 cases.

### Backend ownership — Enes (~50%)

Enes inherits a working Express app with schema and middleware already merged on `main`, and owns every route that operates on cards. He works in parallel with Eric — no dependency on Eric's board endpoints landing first.

**Endpoints (4 of 8) — all in `backend/src/routes/cards.js`:**

| Method | Path                              | Implementation hint                                                                 |
|--------|-----------------------------------|-------------------------------------------------------------------------------------|
| POST   | `/api/boards/:boardId/cards`      | Validates `message` + `gifUrl` required; 404 if parent board missing                |
| DELETE | `/api/cards/:id`                  | 404 if card missing                                                                 |
| PATCH  | `/api/cards/:id/upvote`           | `prisma.card.update({ data: { upvotes: { increment: 1 } } })`                       |

**Router structure:** `cards.js` exports an `express.Router({ mergeParams: true })`. `index.js` mounts it twice: at `/api/boards/:boardId/cards` (so `POST /` inside the router resolves to the create-card contract and `req.params.boardId` is populated) and at `/api/cards` (for the DELETE + two PATCH routes). Inside the router, use `:id` for the card id and rely on the mount path to distinguish.

**Testing:** Postman/Insomnia collection covering all 4 card endpoints with happy-path + 400/404 cases.

**Deliverables in planning.md:**
- Writes the `Spec Reconciliation — Backend (Milestone 2)` section once backend is fully merged (template lives in `guide.md`).

### Single-owner artifacts (no concurrent edits)

To avoid merge conflicts, the following files have one designated writer:

| Artifact                                   | Single owner | Why                                                         |
|--------------------------------------------|--------------|-------------------------------------------------------------|
| `backend/prisma/schema.prisma`             | Eric         | Migration history must be linear; one person runs migrations|
| `backend/prisma/migrations/`               | Eric         | Same reason                                                 |
| `backend/src/routes/boards.js`             | Eric         | Board endpoints are all his; keeps that file conflict-free  |
| `backend/src/routes/cards.js`              | Enes         | Card endpoints are all his; keeps that file conflict-free   |
| `frontend/package.json` + lockfile         | Anny         | Frontend dependency tree is hers                            |
| `backend/package.json` + lockfile          | Eric         | Backend dependency tree is his                              |
| `planning.md` Section 3 (Database Schema)  | Eric         | Schema is the source of truth                               |

Both router files are mounted from `backend/src/index.js`. That file is multi-writer, but router mounts are add-only lines — each dev appends their `app.use(...)` next to the existing mounts rather than reordering, which keeps merges trivial.

If Anny or Enes needs a schema change (new field, type change), they open a PR that updates the Section 3 spec and tags Eric; Eric applies the migration in a follow-up.

### Handoff signal — when Enes can start

Even though Eric and Enes work in parallel after this point, Enes waits for Eric to land a small "shape-setting" slice first, so both routers converge on the same conventions (validation style, response bodies, error handling, file layout) instead of diverging.

Concrete green-light: Enes pulls `main` and starts `backend/src/routes/cards.js` **after** all of the following are merged:
1. `backend/prisma/schema.prisma` matches Section 3 and the init migration is applied. *(merged Jun 30)*
2. `backend/src/index.js` boots cleanly with CORS, JSON parsing, and the error-handler middleware. *(merged Jun 30)*
3. Eric has landed three shape-setting routes in `backend/src/routes/boards.js`, each with passing Postman tests:
   - `POST /api/boards` — establishes the validation-via-`requireFields` + 201-with-full-body pattern that Enes reuses for `POST /api/boards/:boardId/cards`.
   - `GET /api/boards/:id` — establishes the fetch-then-404 pattern that Enes reuses in his two PATCH routes (both need to 404 on missing card before mutating).
   - `DELETE /api/boards/:id` — establishes the delete + 204 No Content pattern (P2025 caught by centralized error handler) that Enes reuses for `DELETE /api/cards/:id`.

Eric's remaining route (`GET /api/boards`) does not gate the handoff and can land after Enes starts.

Until the green-light, Enes is unblocked to: review the spec, set up Postman, write fixture data, or pair-review Eric's PRs.

### Collaboration rules

These rules govern how three people commit against this repo without the spec drifting.

1. **One feature branch per endpoint or per logical chunk.** Branch names: `backend/<resource>-<verb>` (e.g., `backend/boards-create`), `frontend/<component>` (e.g., `frontend/board-grid`). PR into `main`.
2. **Spec-parity rule** (reinforces Maintenance rule below): any PR that changes an API contract, schema field, or component shape **must update the corresponding section of `planning.md` in the same PR**. No "I'll update the spec later." If the PR doesn't update the spec, the spec is now the source of truth and the implementation is wrong.
3. **Schema is single-writer** (Eric). All other planning.md sections are multi-writer — anyone can edit Sections 1, 2, 4, 5 in a PR.
4. **Anny may add components not in Section 1** as the design evolves. She updates Section 1 + Section 4 in the same PR.
5. **No direct pushes to `main`.** Every change goes through a PR, even if the author is the only reviewer.
6. **API contract changes need backend sign-off.** If Anny finds the frontend needs a field the contract doesn't return, she opens an issue or PR proposing the change rather than working around it client-side.

### Status snapshot

A lightweight checklist that gets ticked off as work progresses (any teammate can update):

**Milestone 0 — Planning**
- [x] Repo initialized with `frontend/` and `backend/` directories
- [x] `planning.md` Sections 1–4 drafted
- [x] `planning.md` Section 5 (this section) drafted
- [x] `planning.md` committed to `main`

**Milestone 1 — Frontend (Anny)**
- [x] Figma mockups finalized
- [x] Vite + React Router scaffolded
- [x] Components implemented per Section 1
- [ ] `Decisions Log — Frontend (Milestone 1)` written

**Milestone 2 — Backend (Eric + Enes in parallel after shape-setting handoff)**
- [x] (Eric) Backend scaffold: npm, Prisma, Express, middleware
- [x] (Eric) `schema.prisma` + init migration
- [x] (Eric) Shape-setting routes: `POST /api/boards`, `GET /api/boards/:id`, `DELETE /api/boards/:id` + Postman tests
- [x] (Eric) Handoff signal fires → Enes starts `routes/cards.js`
- [x] (Eric) Remaining route: `GET /api/boards` + Postman tests
- [x] (Enes) 4 card endpoints + Postman tests
- [x] (Enes) `Spec Reconciliation — Backend (Milestone 2)` written

**Milestone 3 — Integration (Anny + Eric)**
- [x] Frontend `fetch` calls wired to backend endpoints
- [x] CORS verified end-to-end
- [x] `Final Spec Reconciliation — Full Pipeline (Milestone 3)` written

---

## Spec Reconciliation — Backend (Milestone 2)

Author: Enes. Written after the four card endpoints landed in `backend/src/routes/cards.js`. Records where the implementation matches the spec and where it deviates, per the Maintenance rule.

### Endpoints delivered

All four card endpoints from Section 5 are implemented in `backend/src/routes/cards.js` and mounted from `backend/src/index.js`:

| Method | Path                           | Status codes verified                     |
|--------|--------------------------------|-------------------------------------------|
| POST   | `/api/boards/:boardId/cards`   | 201 happy path, 400 missing field, 404 missing board |
| DELETE | `/api/cards/:id`               | 204 happy path, 404 missing card          |
| PATCH  | `/api/cards/:id/upvote`        | 200 happy path, 404 missing card          |
| PATCH  | `/api/cards/:id/pin`           | 200 toggle on, 200 toggle off, 404 missing card |

### Matches the spec

- Request/response bodies match Section 2 verbatim, including the `title` field added to `Card` in PR #1. `POST` returns the full card with `upvotes: 0`, `isPinned: false`, `pinnedAt: null`.
- Validation reuses Eric's `requireFields` helper: `["title", "message", "gifUrl"]` are required; `author` is optional and defaults to `null`.
- Error shape is the uniform `{ "error": "..." }` from the centralized handler.
- `pin` is a true toggle: it reads the current row, sets `pinnedAt = new Date()` on pin and `null` on unpin, matching the `CardGrid` pinned-ordering contract in Section 4.

### Deviations and decisions

- **Router mounting.** `cards.js` exports `Router({ mergeParams: true })` and is mounted twice: at `/api/boards/:boardId/cards` (so `POST /` sees `req.params.boardId`) and at `/api/cards` (for the `:id` routes). This is exactly the structure prescribed in Section 5, noted here because it is the one non-obvious wiring detail.
- **404 on missing parent board (POST).** Implemented by catching Prisma's `P2003` foreign-key violation on `create` and rethrowing as `HttpError(404, "Board not found")`, rather than a pre-flight `findUnique`. One round-trip instead of two; the create is still a single statement.
- **404 mechanism differs by route.** `upvote` and `DELETE` rely on Prisma `P2025` reaching the centralized handler (which returns the generic `"Not found"`). `pin` needs an explicit `findUnique` first because it is a toggle, so it returns the more specific `"Card not found"`. This inconsistency in the 404 message string is intentional and mirrors how `boards.js` mixes both mechanisms.

### How it was verified

Ran against a local Postgres (`kudos_board`) with both migrations applied. Booted the server (`npm run start`), created a board, then exercised each endpoint with `curl` for happy-path plus every 400/404 case in the table above — all returned the expected status and body. The equivalent requests are captured in `backend/postman/cards.postman_collection.json` for repeatable runs (set the `baseUrl`, `boardId`, `cardId` collection variables; run top to bottom).

---

## Final Spec Reconciliation — Full Pipeline (Milestone 3)

Author: Eric. Written after wiring `frontend/src/lib/api.js` into every page and modal that previously used mock data. Cross-layer audit — Section 2 contracts vs Express routes vs frontend fetch calls.

### Frontend fetch calls verified against API contracts

All seven core CRUD endpoints are called by the frontend and return the shape documented in Section 2.

| Frontend caller                                     | Endpoint hit                          | Match?                                   |
|-----------------------------------------------------|---------------------------------------|------------------------------------------|
| `HomePage` useEffect (on mount + category/search)   | `GET /api/boards` + query params      | ✅ request + response shape match spec   |
| `CreateBoardModal.handleSubmit`                     | `POST /api/boards`                    | ✅ 201 with full body used to prepend    |
| `BoardCard` delete (via `HomePage.handleDeleteBoard`) | `DELETE /api/boards/:id`            | ✅ 204 → local filter                    |
| `BoardPage` useEffect                               | `GET /api/boards/:id`                 | ✅ `{ ...board, cards: [...] }` unpacked |
| `CreateCardModal.handleSubmit`                      | `POST /api/boards/:boardId/cards`     | ✅ 201 with full body used to prepend    |
| `CardTile` upvote (via `BoardPage.handleUpvote`)    | `PATCH /api/cards/:id/upvote`         | ✅ server-truth spliced back (no +1 drift) |
| `CardTile` delete (via `BoardPage.handleDelete`)    | `DELETE /api/cards/:id`               | ✅ 204 → local filter                    |

### Integration gaps found and resolved

- **Stale Prisma client.** `schema.prisma` had `Card.title` (from the Jul 1 migration) but `node_modules/.prisma/client/` was generated before that migration and rejected the field at runtime with a `PrismaClientValidationError`. Resolved by running `prisma generate` after `prisma migrate deploy`. Added `prisma generate` to the sync step of the integration playbook so this doesn't repeat.
- **`SearchBar` missing submit button.** README rubric requires a visible Submit/Search button; the component only handled Enter-key submit. Added a `<button type="submit">search</button>` next to the input, styled with the same pill vocabulary as the other buttons. Existing Enter-key path unchanged.
- **`BoardCard` missing optional author.** Section 1 lists `optional author` in the render list; the initial implementation only rendered `category + title`. Added a `.board-card__author` line under the title, styled to match `CardTile`'s author line.
- **Local `main` was 22 commits behind origin.** Eric had been working on `backend/boards-routes`; fast-forwarded before integration. No merge conflicts.
- **Nested `<form>` in `GiphySearch` closed `CreateCardModal` on every click.** `GiphySearch` rendered its own `<form onSubmit={runSearch}>` while sitting inside `CreateCardModal`'s outer `<form onSubmit={handleSubmit}>`. Nested forms are invalid HTML; clicking the inner `type="submit"` button submitted the outer form (React logs `<form> cannot be a descendant of <form>`) and the resulting page reload reset `isCreateCardOpen` to `false`. Replaced the inner `<form>` with a `<div>`, kept Enter-to-search on the input via `onKeyDown`, and set the button to `type="button"`.
- **Broken image URLs showed a blank spot.** `BoardCard` and `CardTile` rendered `<img src>` with no fallback, so any board/card whose `imageUrl`/`gifUrl` 404s displayed nothing. Added an `onError` handler that swaps in an inline SVG placeholder saying "image unavailable".
- **GIPHY integration.** Wired `GiphySearch` to `https://api.giphy.com/v1/gifs/{trending,search}` directly from the browser per Section 1, using `VITE_GIPHY_API_KEY` from `frontend/.env.local` (gitignored). Trending is fetched on mount to give the picker something to show without typing; search runs on button click or Enter. Real GIPHY CDN URLs are what get saved to `Card.gifUrl` and animate in `CardTile`. Backend proxy is intentionally not built (`frontend-planning.md §5.2` reference is stale).

### Intentional divergences (deferred, not gaps)

- **`Header` rendered per-page instead of above `<Routes>`.** Section 1 puts `Header` at the App level. Anny's implementation mounts `<Header />` inside each page (`HomePage.jsx`, `BoardPage.jsx`) instead. Functionally equivalent; kept per-page.
- **Length/URL validation.** Section 2 specifies length limits (title 1–100, message 1–500, author max 50) and "valid URL" for image/gif fields. `requireFields` only checks presence. Rubric doesn't require the limits, so deferred.

### Deferred stretch features (chosen not to implement)

- **Pinned Cards.** Cut. Backend endpoint (`PATCH /api/cards/:id/pin`) and schema fields (`isPinned`, `pinnedAt`) were built during Milestone 2 (see Enes's reconciliation above) but were later removed — see the "Spec change — Pinned Cards removed" note at the bottom of this file. Frontend UI was never built.
- **Dark Mode.** No `ThemeProvider` or `DarkModeToggle` built. Section 1 references stay in the spec as future work.
- **User Accounts.** Out of scope per Section 5. `Header` still shows `log in` / `register` buttons as visual placeholders; they route to `LoginPage` / `SignupPage` which are Anny's design stubs — no backend auth exists.

### State architecture verified

State variables in Section 4 match the implementation, with the following additions from integration work:

- `HomePage`: added `isLoading` and `error` state for the fetch lifecycle. Deleted `filterBoards` — filtering pushed to the server.
- `BoardPage`: added `isLoading`, `notFound`, and `error` state. `board` and `cards` now sourced from `GET /api/boards/:id` instead of mock imports.
- `CreateBoardModal` and `CreateCardModal`: added `isSubmitting` state (already promised in `frontend-planning.md §4`, now real).

### Final code-spec parity assessment

Section 2 (API contracts) and Section 3 (schema) fully match the implementation. Section 1 (components) matches with the divergences noted above (per-page `Header`, no `ThemeProvider`/`DarkModeToggle`). Section 4 (state) matches with the small additions listed above. The core feature checklist in `README.md` is fully covered; Dark Mode remains a deferred stretch feature.

---

## Spec change — Pinned Cards removed

Cut on 2026-07-02. The `PATCH /api/cards/:id/pin` route, the `isPinned` / `pinnedAt` columns on `Card`, and the frontend hooks that referenced them are all gone. Migration `20260703005907_drop_card_pin` drops the two columns. Enes's Milestone 2 reconciliation above is preserved verbatim because it accurately describes what shipped at the time; the current spec (Sections 1–5) no longer mentions pin.

## Spec change — User Accounts added

Added on 2026-07-02. User Accounts started as an out-of-scope stretch feature (see the Milestone 3 reconciliation above) but was subsequently built rather than restate Sections 1–3 for a feature that landed after the original spec froze, this section records what was added. Source-of-truth is the code.

### Schema (see `backend/prisma/schema.prisma` and migrations `20260702212419_add_user`, `20260702235219_add_ownership`)

New model `User`:

| Field          | Type     | Required | Default | Notes                             |
|----------------|----------|----------|---------|-----------------------------------|
| `id`           | String   | yes      | `cuid()`| Primary key.                      |
| `username`     | String   | yes      | —       | Unique.                           |
| `email`        | String   | yes      | —       | Unique.                           |
| `passwordHash` | String   | yes      | —       | bcrypt hash (cost 10).            |
| `createdAt`    | DateTime | yes      | `now()` |                                   |

Added to `Board` and `Card`: nullable `authorId` (FK → `User.id`, `onDelete: SetNull`). Nullable is intentional — orphaned rows survive when their author's account is deleted, and anonymous cards remain supported.

### API endpoints

New router `backend/src/routes/auth.js` mounted at `/api/auth`:

- `POST /api/auth/register` — Body: `{ username, email, password }`. 201 → `{ user, token }`. 400 on missing fields or password < 8 chars. 409 on username/email already in use.
- `POST /api/auth/login` — Body: `{ username, password }`. 200 → `{ user, token }`. 401 on either wrong username OR wrong password (deliberately indistinguishable so usernames can't be enumerated).
- `GET /api/auth/me` — Requires bearer token. 200 → `{ user }`. 401 if the token is missing/invalid/expired or the user no longer exists.

`user` shape returned by all three: `{ id, username, email, createdAt }` — `passwordHash` is never exposed. Token is a JWT signed with `JWT_SECRET` (env var, added to `.env.example`), TTL 7 days.

### Authentication on existing routes

| Route                              | Auth       | Notes                                                                 |
|------------------------------------|------------|-----------------------------------------------------------------------|
| `GET /api/boards`                  | optional   | Adds `?mine=true` query param — 401 if `mine=true` without valid token; otherwise ignores auth. |
| `POST /api/boards`                 | required   | Stamps `authorId = req.user.id` on the new board.                     |
| `GET /api/boards/:id`              | none       | Unchanged.                                                            |
| `DELETE /api/boards/:id`           | required   | 403 if `board.authorId` set and ≠ `req.user.id`. Orphan boards (`authorId === null`) are deletable by any logged-in user. |
| `POST /api/boards/:boardId/cards`  | optional   | If token present, stamps `authorId`; anonymous cards still allowed.   |
| `DELETE /api/cards/:id`            | required   | Same ownership rule as boards.                                        |
| `PATCH /api/cards/:id/upvote`      | none       | Unchanged.                                                            |

### Frontend

- `src/context/AuthContext.jsx` — owns `user` + `token`; rehydrates on mount via `GET /api/auth/me`; exposes `login`, `register`, `logout`.
- `src/pages/LoginPage.jsx`, `src/pages/SignupPage.jsx` — the previously stubbed "log in / register" placeholders are now real.
- `src/lib/permissions.js` — `canDeleteRow(user, row)` mirrors the backend ownership rule so the delete button doesn't show up on rows the user can't actually delete.
- `HomePage` — hides "Add a new board" unless logged in; adds a "mine" tab to `CategoryFilter` that maps to `?mine=true`; falls back to "all" if the user logs out while on that tab.
- `Header` — swaps between "log in / register" and "logged in as X / log out".

### Env vars added

`.env.example` documents `JWT_SECRET` (backend) alongside the existing `DATABASE_URL`, `FRONTEND_ORIGIN`, `PORT`.

## Maintenance rule

Whenever an implementation change diverges from this spec — a renamed field, an added endpoint, a moved piece of state — update the relevant section in this file in the same commit. Submission goal: code-spec parity.
