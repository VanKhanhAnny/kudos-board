# Kudos Board — Frontend Planning
**Stack:** Vite + React (JavaScript) + React Router

Frontend build is **complete against the requirements**. This document is now a handoff reference for backend integration.

---

## 1. Current status

All core requirements are implemented. UI runs entirely on mock data — swap to real API is a per-page edit once backend endpoints are live.

### Completed
- **HomePage** (`/`) — decorative hero mosaic, scroll-triggered quote, search, category filter, add-board button, boards grid, footer.
- **BoardPage** (`/boards/:boardId`) — board title + category, add-card button, cards grid, upvote + delete per card, back link.
- **LoginPage** (`/login`) — username + password with eye-toggle. Frosted panel over the same hero mosaic.
- **SignupPage** (`/register`) — username + email + password + confirm password with eye-toggles.
- **Modals** — reusable `Modal` shell (ESC + click-outside + body scroll lock). `CreateBoardModal` (title, category, imageUrl, author). `CreateCardModal` (title, message, gif via `GiphySearch`, author).
- **Delete / upvote** — inline actions on cards; hover-revealed delete + view on board cards.
- **Header** — fixed top-right auth buttons; when `?logged-in=true` in URL, swaps to a glowing "Hi Anny!" pill with a sign-out dropdown (UI preview only; no real session).
- **API client** — [`src/lib/api.js`](frontend/src/lib/api.js) with one function per endpoint, ready to swap in.
- **Responsive** — breakpoints on the boards grid, cards grid, auth layout.
- **Session persistence** — `sessionStorage` keeps home page scroll + selected category when returning from a board detail page.
- **Hero intro animation** — every tile flickers to life on mount; 20% of tiles keep an ambient blink after.

### Deliberately not built
- **Pinning cards** (stretch feature in the base [planning.md](planning.md)). Not in the base requirements you pasted; skip unless needed.
- **Dark mode** (stretch feature). Not implemented.
- **Real GIPHY** — `GiphySearch` uses `heroImages` as mock results. Requires a backend proxy (`/api/giphy/search`) since the API key must stay server-side.
- **Real auth** — login/signup forms currently `navigate('/')` on submit. When backend adds `POST /auth/login` and `POST /auth/register`, wire those into the submit handlers and add a session-aware `AuthContext`.
- **Loading + error states** — only meaningful against a real API. Add during backend integration.
- **Board cover image on BoardPage** — detail page currently shows title + category only, not `board.imageUrl`. Small 5-min addition; do when convenient.

### Known small issues to revisit
- `.hero-tile-grid` has `filter: grayscale(1)` on the parent, which mutes the `saturate(1.5)` in child blink animation.
- Global `h1..h6, p, a, span, button` color override in `index.css` is heavy-handed; requires `!important` in a handful of places. Long-term: scope to a wrapper class.

---

## 2. File map

```
frontend/src/
├── App.jsx                    BrowserRouter + 4 routes
├── App.css
├── index.css                  Global type + colors
├── main.jsx                   Entry
│
├── assets/
│   ├── DSC*, IMG_*.JPG        Hero mosaic source images
│   └── icons/
│       ├── eye.png            Password field: show
│       ├── hidden.png         Password field: hide
│       ├── human.png          (unused)
│       ├── mail.png           Auth field icon
│       └── username.png       Auth field icon
│
├── data/                      Mock data (temporary; deleted when backend is real)
│   ├── heroImages.js          16 imported image URLs
│   ├── heroTiles.js           540 { id, imageUrl } tiles for the hero mosaic
│   ├── realBoards.js          10 sample boards
│   └── mockCards.js           Cards keyed by board id (4–9 per board)
│
├── lib/
│   └── api.js                 Fetch wrapper with 8 endpoints
│
├── pages/
│   ├── HomePage.jsx / .css
│   ├── BoardPage.jsx / .css
│   ├── LoginPage.jsx
│   └── SignupPage.jsx
│
└── components/
    ├── Header.jsx / .css              Fixed top-right auth pills or "Hi Anny!"
    ├── Footer.jsx / .css
    │
    ├── HeroTile.jsx / .css            Single decorative mosaic tile
    ├── HeroTileGrid.jsx / .css        30×18 mosaic
    ├── HeroText.jsx / .css            "grateful" + sparkle w/ progressive blur
    ├── ScrollQuote.jsx / .css         Fades in on scroll
    │
    ├── SearchBar.jsx / .css
    ├── CategoryFilter.jsx / .css
    ├── AddButton.jsx / .css           Reused for "+ new board" and "+ new card"
    │
    ├── BoardCard.jsx / .css           Board tile with view + delete on hover
    ├── BoardsSection.jsx / .css       Grid of BoardCards + empty state
    │
    ├── CardTile.jsx / .css            Card w/ image + title + message + upvote + delete
    ├── CardGrid.jsx / .css            Grid of CardTiles + empty state
    │
    ├── Modal.jsx / .css               Reusable modal shell
    ├── formFields.css                 Shared field/label/button styles
    ├── CreateBoardModal.jsx / .css
    ├── CreateCardModal.jsx
    ├── GiphySearch.jsx / .css         Mock GIPHY (uses heroImages)
    │
    ├── AuthLayout.jsx / .css          Frosted panel + sparkle over hero mosaic
    ├── AuthForm.css                   Shared title / submit / footer styles
    └── IconField.jsx / .css           Pill input w/ icon + password eye toggle
```

---

## 3. Routes

```
/                    → HomePage
/boards/:boardId     → BoardPage
/login               → LoginPage
/register            → SignupPage
```

`?logged-in=true` on any route makes the Header show "Hi Anny!" + sign-out dropdown. This is a UI preview flag only — delete when real auth ships.

---

## 4. State summary

| Component | Owns |
|---|---|
| `HomePage` | `boards`, `selectedCategory`, `searchQuery`, `isCreateBoardOpen`. Persists `selectedCategory` + scroll to `sessionStorage`. |
| `BoardPage` | `cards`, `isCreateCardOpen`. Reads `boardId` from `useParams`. Resets scroll on mount. |
| `SearchBar` | Local `value`. Reports `onSearch(value)` per keystroke. |
| `CreateBoardModal` | `title`, `category`, `imageUrl`, `author`, `error`. Resets on close. |
| `CreateCardModal` | `title`, `message`, `author`, `selectedGifUrl`, `error`. |
| `GiphySearch` | `query`, `results`, `isLoading`. Uses mock search. |
| `Header` | `isMenuOpen` (sign-out dropdown). Reads `logged-in` from URL search params. |
| `LoginPage` / `SignupPage` | Form fields + `error`. |

No global store. `AuthContext` will be needed once real auth lands.

---

## 5. What the backend needs to deliver

Full contract in [planning.md](planning.md) section 2. Summary of what the frontend actually calls:

### 5.1 Data models

**`Board`** — rendered by `BoardCard`, `BoardsSection`, `BoardPage`:
```
{
  id: string,
  title: string,
  category: "CELEBRATION" | "THANK_YOU" | "INSPIRATION",
  imageUrl: string,        // REQUIRED
  author: string | null,
  createdAt: ISO string
}
```

**`Card`** — rendered by `CardTile`:
```
{
  id: string,
  boardId: string,
  title: string,           // REQUIRED
  message: string,
  gifUrl: string,
  author: string | null,
  upvotes: number,
  createdAt: ISO string
}
```

### 5.2 Endpoints called by [src/lib/api.js](frontend/src/lib/api.js)

| Method + path | Called by | Request body / query | Returns |
|---|---|---|---|
| `GET /boards` | `HomePage` on mount + on filter/search change | `?category=` / `?filter=recent` / `?search=` | `Board[]` |
| `POST /boards` | `CreateBoardModal` submit | `{ title, category, imageUrl, author? }` | `Board` |
| `GET /boards/:id` | `BoardPage` on mount | — | `Board & { cards: Card[] }` |
| `DELETE /boards/:id` | `BoardCard` delete button | — | `204` |
| `POST /boards/:boardId/cards` | `CreateCardModal` submit | `{ title, message, gifUrl, author? }` | `Card` |
| `DELETE /cards/:id` | `CardTile` delete button | — | `204` |
| `PATCH /cards/:id/upvote` | `CardTile` upvote button | — | `Card` (updated) |
| `GET /giphy/search?q=` | `GiphySearch` submit | `?q=...` | `[{ id, url, previewUrl }]` |

### 5.3 Filter / search behavior

Backend does the work; frontend just forwards query params:
- `?category=CELEBRATION|THANK_YOU|INSPIRATION` → only that category.
- `?filter=recent` → 6 most-recent boards (ignores `category` if both).
- `?search=summer` → case-insensitive substring on `Board.title`.
- No params → all boards. Sort: `createdAt` DESC.

### 5.4 Errors

- All 4xx / 5xx return `{ "error": "human-readable message" }` — the api client throws with `.message` set to that string, so submit handlers can `try/catch` and surface `errorMessage` in modals.
- CORS: allow Vite dev origin (usually `http://localhost:5173`), configurable via `FRONTEND_ORIGIN` env var.

### 5.5 Environment

- Frontend reads `VITE_API_URL` at build time (defaults to `http://localhost:3000/api`).
- Local dev file: [`frontend/.env`](frontend/.env) (gitignored). Template: [`frontend/.env.example`](frontend/.env.example).

### 5.6 Contract diffs already logged

Two updates needed in [planning.md](planning.md) before backend implementation:
1. **`Board.imageUrl` required** (spec has it optional).
2. **`Card.title` field added** (spec has only `message`). Include in `POST /boards/:boardId/cards` body.

---

## 6. Backend integration — swap plan

Not "build features," just "swap mock writes for real fetches." Order:

1. **Copy `.env.example` → `.env`**, set `VITE_API_URL` to backend host.
2. **`HomePage`** — replace `useState(realBoards)` + local `filterBoards()` with `useEffect(() => api.getBoards({...}), [category, search])`. Delete client-side filtering.
3. **`CreateBoardModal`** — replace `onCreate` local prepend with `api.createBoard(payload)`.
4. **`BoardCard` delete** — replace local splice with `api.deleteBoard(id)` (keep optimistic UI).
5. **`BoardPage`** — replace `useState(mockCardsByBoard[boardId])` with `api.getBoard(boardId)`.
6. **`CreateCardModal`** — replace `onCreate` with `api.createCard(boardId, payload)`.
7. **`CardTile` upvote / delete** — call `api.upvoteCard` / `api.deleteCard`.
8. **`GiphySearch`** — replace `mockSearch()` with `api.searchGiphy(query)`.
9. **Delete mock data** — `realBoards.js`, `mockCards.js`. Keep `heroTiles.js` + `heroImages.js` (used by the decorative mosaic).
10. **Loading + error states** — each page gets an `isLoading` boolean and an error banner. Modal error messages already have a slot.
11. **Real auth** — replace `?logged-in=true` URL flag with `AuthContext` reading from `POST /auth/login` response. Add sign-out to hit `POST /auth/logout` (or clear token).

Each step is a small, isolated edit — no page rewrites.

## Decisions Log — Frontend (Milestone 1)

- **Component that diverged most from the original spec**: `BoardCard` — the original spec had one `BoardCard` used everywhere. In practice, the "boards" on the homepage split into two different components: `HeroTile` (decorative mosaic tile in the hero background — just a random image, blinks) and `BoardCard` (real board card — grayscale image, category label, title, hover-revealed view + delete buttons).
  **What I changed**: Split the original `BoardCard` into two components under different names. `HeroTile` / `HeroTileGrid` render the decorative 30×18 hero mosaic. `BoardCard` / `BoardsSection` render the real interactive boards below the hero. Introduced a new `heroTiles.js` data file (just `{ id, imageUrl }`) that's separate from `realBoards.js` (`{ id, title, category, imageUrl, ... }`) — the mosaic doesn't need "board" fields.

- **State variable I needed that wasn't in the original spec**: `sessionStorage`-backed `kudos:home:category` and `kudos:home:scroll` on `HomePage`. The spec assumed `selectedCategory` and scroll position were fine as local component state, but React Router remounts `HomePage` when you click a board card and come back, wiping both. Users landed at the top of the page on the "all" tab every time.
  **Which component owns it**: `HomePage` — the state itself is still local `useState`, but `useEffect` writes `selectedCategory` to `sessionStorage` on change, and the scroll position gets written right before navigating to a board detail page. On mount, both are read back and restored (scroll key is deleted after restore so a fresh reload still lands at the top).

- **Prop that didn't match the API response shape and required adjustment**: `Board.imageUrl` was **optional** in the original [planning.md](planning.md) spec (Section 3, "optional cover image; UI falls back per category"), but the new requirements brief the user pasted made it **required** on create. Same for `Card.title` — the original spec had only `message` on cards, but the new brief added `title`. Both are logged as contract diffs in Section 5.6, but they also changed the frontend: `CreateBoardModal` now validates that `imageUrl` is filled before submit (won't allow a category-based fallback), and `CardTile` renders `card.title` as an `<h3>` above `card.message`. Mock data (`realBoards.js`, `mockCards.js`) updated to include these fields so the UI wouldn't render blank spots.
