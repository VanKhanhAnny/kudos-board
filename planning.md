# Kudos Board — Project Specification

This document is the spec the rest of the project implements against. Scope: all CORE features from `README.md` plus two stretch features (Pinned Cards and Dark Mode). User Accounts and Comments are out of scope for this version of the spec.

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
  - Card pinned/unpinned → update that card's `isPinned` + `pinnedAt`, re-sort.

#### `BoardPageHeader`
- **Responsibility:** Shows board title, category, author, and a back link.
- **Renders:** Heading text, category badge, author (if present), back-to-home link.
- **Props:** `board: Board`.
- **State:** none.
- **Interactions:** Back link → navigate to `/`.

#### `CardGrid`
- **Responsibility:** Lays out cards in a grid, with pinned cards sorted to the front (most-recently pinned first), then non-pinned by `createdAt` descending.
- **Renders:** A grid of `CardTile` components, or an empty-state message.
- **Props:** `cards: Card[]`, `onUpvote(cardId)`, `onDelete(cardId)`, `onTogglePin(cardId)`.
- **State:** none (sorting derived inside render from props).
- **Interactions:** none directly (delegates to `CardTile`).

#### `CardTile`
- **Responsibility:** Single card display with message, gif, upvote count, pin button, delete button.
- **Renders:** Gif image, message text, optional author, upvote button + count, pin button (filled if pinned), delete button.
- **Props:** `card: Card`, `onUpvote(cardId)`, `onDelete(cardId)`, `onTogglePin(cardId)`.
- **State:** none.
- **Interactions:**
  - Upvote click → `onUpvote(card.id)`.
  - Pin click → `onTogglePin(card.id)`.
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
- **Renders:** Backdrop, form with message textarea, author input (optional), `GiphySearch`, Submit and Cancel buttons.
- **Props:** `isOpen: boolean`, `boardId: string`, `onClose()`, `onCardCreated(card)`.
- **State:**
  - `message: string`
  - `author: string`
  - `selectedGifUrl: string | null`
  - `isSubmitting: boolean`
  - `errorMessage: string | null`
- **Interactions:**
  - Form submit (only enabled when `message` and `selectedGifUrl` are set) → `POST /api/boards/:boardId/cards`, on success call `onCardCreated(newCard)` then `onClose()`.
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
  - User types and submits → fetch GIPHY search API (call goes through the backend proxy to keep the API key secret).
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
      "imageUrl": "string | null",
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
    "imageUrl": null,
    "createdAt": "..."
  }
  ```
- **Errors:**
  - `400 Bad Request` — missing/invalid `title` or `category`. Body: `{ "error": "title is required" }` (or similar).
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
    "imageUrl": "... | null",
    "createdAt": "...",
    "cards": [
      {
        "id": "uuid",
        "message": "...",
        "gifUrl": "...",
        "author": "... | null",
        "upvotes": 0,
        "isPinned": false,
        "pinnedAt": null,
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
    "message": "string (required, 1-500 chars)",
    "gifUrl": "string (required, valid URL)",
    "author": "string (optional, max 50 chars)"
  }
  ```
- **Success — 201 Created:**
  ```json
  {
    "id": "uuid",
    "message": "...",
    "gifUrl": "...",
    "author": "... | null",
    "upvotes": 0,
    "isPinned": false,
    "pinnedAt": null,
    "createdAt": "...",
    "boardId": "uuid"
  }
  ```
- **Errors:**
  - `400 Bad Request` — missing/invalid `message` or `gifUrl`.
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

### `PATCH /api/cards/:id/pin`

Toggle a card's pinned state. If pinning, sets `isPinned = true` and `pinnedAt = now`. If unpinning, sets `isPinned = false` and `pinnedAt = null`.

- **Request body:** none.
- **Success — 200 OK:** returns the updated card.
- **Errors:**
  - `404 Not Found` — card does not exist.
  - `500 Internal Server Error`.

### Cross-cutting

- All 4xx/5xx responses use a uniform shape: `{ "error": "human-readable message" }`.
- CORS allows the frontend origin (configured via `FRONTEND_ORIGIN` env var).
- A GIPHY proxy endpoint may be added later (e.g., `GET /api/giphy/search?q=...`) so the API key isn't exposed in the frontend — not in this spec's required list, but called out as a likely addition.

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
| `imageUrl`  | String?    | no       | `null`  | Optional cover image; UI falls back per category. |
| `createdAt` | DateTime   | yes      | `now()` | Used for "Recent" filter and grid ordering.   |
| `cards`     | `Card[]`   | —        | —       | Relation: one Board has many Cards.           |

### Model: `Card`

| Field       | Type     | Required | Default | Notes                                          |
|-------------|----------|----------|---------|------------------------------------------------|
| `id`        | String   | yes      | `cuid()`| Primary key.                                   |
| `message`   | String   | yes      | —       | 1–500 chars (validated in API layer).          |
| `gifUrl`    | String   | yes      | —       | GIPHY URL chosen by the user.                  |
| `author`    | String?  | no       | `null`  | Optional creator display name.                 |
| `upvotes`   | Int      | yes      | `0`     | Incremented by upvote endpoint.                |
| `isPinned`  | Boolean  | yes      | `false` | Toggled by pin endpoint.                       |
| `pinnedAt`  | DateTime?| no       | `null`  | Set when pinned, cleared when unpinned. Drives pinned-ordering. |
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
| `cards`                 | `Card[]`        | `[]`          | `BoardPage` | Set from initial fetch; mutated by create/delete/upvote/pin callbacks.      |
| `isCreateCardModalOpen` | `boolean`       | `false`       | `BoardPage` | "Create Card" button click (open); modal close or successful create (close).|

### `CreateCardModal`

| State variable    | Type             | Initial value | Owner             | Update trigger                                  |
|-------------------|------------------|---------------|-------------------|-------------------------------------------------|
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

- **Sorted card list** in `CardGrid`: derived inside render from `cards` prop. Pinned cards first, ordered by `pinnedAt` descending; then unpinned cards, ordered by `createdAt` descending.
- **Filtered/searched board list**: NOT derived on the frontend. Filtering and search are pushed to the backend via `GET /api/boards` query params, so what comes back is already the right set.

---

## Section 5: Work Allocation

This section assigns concrete ownership for every artifact in the project. Sections 1–4 are the *integration contract* — what gets built. This section is the *team contract* — who builds what, and how we avoid stepping on each other.

### Roles

- **Anny** — Frontend Lead (Milestone 1). Currently in Figma design phase; will translate to code once mockups are settled.
- **Eric** (me) — Backend Lead (Milestone 2). Owns project scaffolding, schema, and the majority of routes.
- **Enes** — Backend Support (Milestone 2). Picks up the remaining card-mutation endpoints after Eric hands off.
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
- GIPHY API integration in `GiphySearch` (the spec leaves room for either a direct browser call or a backend proxy — Anny picks based on whether she's OK exposing the API key)

**State (per Section 4):**
- Everything: page-level state (`HomePage`, `BoardPage`), modal state (`CreateBoardModal`, `CreateCardModal`), `SearchBar.inputValue`, `GiphySearch` state, `ThemeProvider` Context

**Deliverables in planning.md:**
- Writes the `Decisions Log — Frontend (Milestone 1)` section once frontend is done (template lives in `guide.md`).

### Backend ownership — Eric (~75%)

Eric owns the foundation everyone else builds on, plus the 6 non-mutation endpoints.

**Foundation (shared infrastructure, must land before Enes can start):**
- `cd backend && npm init -y`
- Install `express`, `@prisma/client`, `cors`, `dotenv`; dev-install `prisma`
- `npx prisma init` → generates `backend/prisma/schema.prisma`
- Implement `schema.prisma` from the Section 3 spec verbatim
- First migration: `npx prisma migrate dev --name init`
- `backend/src/index.js` — Express bootstrap, JSON body parser, CORS middleware reading `FRONTEND_ORIGIN` from env
- Shared middleware: centralized error handler, request-body validation helpers (Enes will reuse these on his two PATCH routes)
- `backend/.env.example` documenting `DATABASE_URL`, `FRONTEND_ORIGIN`, `PORT`

**Endpoints (6 of 8):**

| Method | Path                                | Notes                                          |
|--------|-------------------------------------|------------------------------------------------|
| GET    | `/api/boards`                       | Supports `category`, `filter=recent`, `search` query params |
| POST   | `/api/boards`                       | Validates `title` + `category` required        |
| GET    | `/api/boards/:id`                   | Uses Prisma `include: { cards: true }`         |
| DELETE | `/api/boards/:id`                   | Cascade via FK `onDelete: Cascade`             |
| POST   | `/api/boards/:boardId/cards`        | 404 if parent board missing                    |
| DELETE | `/api/cards/:id`                    | —                                              |

**Testing:** Postman/Insomnia collection covering all 6 endpoints with happy-path + 400/404 cases.

### Backend ownership — Enes (~25%)

Enes inherits a working Express app with schema, middleware, and 6 endpoints already merged on `main`. His scope is intentionally small and isolated.

**Endpoints (2 of 8):**

| Method | Path                              | Implementation hint                                                                 |
|--------|-----------------------------------|-------------------------------------------------------------------------------------|
| PATCH  | `/api/cards/:id/upvote`           | `prisma.card.update({ data: { upvotes: { increment: 1 } } })`                       |
| PATCH  | `/api/cards/:id/pin`              | Fetch card, toggle `isPinned`, set `pinnedAt = new Date()` on pin / `null` on unpin |

**Testing:** Postman/Insomnia tests for both routes (happy path + 404).

**Deliverables in planning.md:**
- Writes the `Spec Reconciliation — Backend (Milestone 2)` section once backend is fully merged (template lives in `guide.md`).

### Single-owner artifacts (no concurrent edits)

To avoid merge conflicts, the following files have one designated writer:

| Artifact                                   | Single owner | Why                                                         |
|--------------------------------------------|--------------|-------------------------------------------------------------|
| `backend/prisma/schema.prisma`             | Eric         | Migration history must be linear; one person runs migrations|
| `backend/prisma/migrations/`               | Eric         | Same reason                                                 |
| `frontend/package.json` + lockfile         | Anny         | Frontend dependency tree is hers                            |
| `backend/package.json` + lockfile          | Eric         | Backend dependency tree is his                              |
| `planning.md` Section 3 (Database Schema)  | Eric         | Schema is the source of truth                               |

If Anny or Enes needs a schema change (new field, type change), they open a PR that updates the Section 3 spec and tags Eric; Eric applies the migration in a follow-up.

### Handoff signal — when Enes can start

Concrete green-light: Enes pulls `main` and starts his two PATCH routes **after** all of the following are merged:
1. `backend/prisma/schema.prisma` matches Section 3 and the init migration is applied.
2. `backend/src/index.js` boots cleanly with CORS, JSON parsing, and the error-handler middleware.
3. Eric's 6 endpoints are merged and pass Postman tests.

Until then, Enes is unblocked to: review the spec, set up Postman, write fixture data, or pair-review Eric's PRs.

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
- [ ] `planning.md` committed to `main`

**Milestone 1 — Frontend (Anny)**
- [ ] Figma mockups finalized
- [ ] Vite + React Router scaffolded
- [ ] Components implemented per Section 1
- [ ] `Decisions Log — Frontend (Milestone 1)` written

**Milestone 2 — Backend (Eric, then Enes)**
- [ ] (Eric) Backend scaffold: npm, Prisma, Express, middleware
- [ ] (Eric) `schema.prisma` + init migration
- [ ] (Eric) 6 endpoints + Postman tests
- [ ] (Eric) Handoff signal: all of above on `main`
- [ ] (Enes) PATCH upvote + PATCH pin + Postman tests
- [ ] (Enes) `Spec Reconciliation — Backend (Milestone 2)` written

**Milestone 3 — Integration (Anny + Eric)**
- [ ] Frontend `fetch` calls wired to backend endpoints
- [ ] CORS verified end-to-end
- [ ] `Final Spec Reconciliation — Full Pipeline (Milestone 3)` written

---

## Maintenance rule

Whenever an implementation change diverges from this spec — a renamed field, an added endpoint, a moved piece of state — update the relevant section in this file in the same commit. Submission goal: code-spec parity.
