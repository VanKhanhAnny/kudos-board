# Kudos Board — Frontend Planning
**Stack:** Vite + React (JavaScript) + React Router

---

## 1. Current status

### Built
- `HomePage` shell: fixed hero with decorative image mosaic, dark overlay, "grateful" text; scrollable page with quote + boards below.
- `HeroTile` / `HeroTileGrid`: 30×18 decorative mosaic. 20% of tiles infinite-blink with brightness + glow halo. Purely visual — feeds off `heroTiles.js` (`{ id, imageUrl }` only).
- `HeroText`: sparkle + "grateful" word rendered as 4 stacked copies (sharp + 3 blur levels) with mask gradients for progressive blur.
- `Header`: fixed top-right auth buttons (`log in` = solid black w/ grey text, `register` = solid white).
- `ScrollQuote`: italic quote that fades + slides + un-blurs on scroll into view. Dark backdrop, white text with glow.
- `SearchBar`: pill input with clear button. Currently reports `onSearch(value)` per keystroke.
- `CategoryFilter`: 5 tab pills — All / Recent / Celebration / Thank You / Inspiration.
- `BoardCard`: grayscale image → hover reveals color + zoom. View + Delete buttons appear on hover (bottom gradient). Shows category label + title below.
- `BoardsSection`: responsive 4/3/2/1-column grid of `BoardCard`s. Empty state message.
- Mock data: `heroImages.js` (16 JPGs), `heroTiles.js` (540 tiles), `realBoards.js` (10 sample boards).

### Not yet built
- Router setup (`react-router-dom` not installed).
- API client (`src/lib/api.js`).
- Create board modal + button.
- Board detail page (`/boards/:id`): cards grid, create card, delete card, upvote card.
- GIPHY search widget.
- Auth flows behind `log in` / `register` buttons.

### Known issues to revisit
- `.hero-tile-grid` has `filter: grayscale(1)` on the parent, muting the `saturate(1.5)` in child blink animation.
- Global `h1..h6, p, a, span, button` color override in `index.css` is too aggressive — forcing `!important` in hero + quote to compensate. Better long-term: scope global text color to a class or wrapper.

---

## 2. Routes

```
/                    → HomePage   (hero + quote + filter + search + boards)
/boards/:boardId     → BoardPage  (single board + cards)
```

Wrap in `<BrowserRouter>` inside `App.jsx`.

---

## 3. Component tree

```
App
└── BrowserRouter
    ├── Header                              (fixed top-right; log in + register)
    ├── Routes
    │   ├── "/"        → HomePage
    │   │                ├── HeroSection
    │   │                │   ├── HeroTileGrid            (decorative)
    │   │                │   │   └── HeroTile   (× 540)
    │   │                │   └── HeroText
    │   │                ├── ScrollQuote
    │   │                ├── SearchBar
    │   │                ├── CategoryFilter
    │   │                ├── CreateBoardButton           (not yet built)
    │   │                ├── CreateBoardModal            (conditional, not yet built)
    │   │                └── BoardsSection
    │   │                    └── BoardCard   (× N, view + delete on hover)
    │   └── "/boards/:id" → BoardPage       (not yet built)
    │                        ├── BoardPageHeader
    │                        ├── CreateCardButton
    │                        ├── CreateCardModal
    │                        │   └── GiphySearch
    │                        └── CardGrid
    │                            └── CardTile
    └── Footer                              (not yet built)
```

---

## 4. State (owned by frontend)

### `HomePage` (current)
| State              | Type       | Initial     | Trigger                                                  |
|--------------------|------------|-------------|----------------------------------------------------------|
| `boards`           | `Board[]`  | `realBoards`| Set from API; mutated by delete callback.                |
| `selectedCategory` | `string`   | `"all"`     | `CategoryFilter` click.                                  |
| `searchQuery`      | `string`   | `""`        | `SearchBar` submit / clear.                              |

**Note:** filtering is done client-side right now for the mock data. Will move to backend query params once API is live.

### `SearchBar`
| State   | Type     | Initial | Trigger                       |
|---------|----------|---------|-------------------------------|
| `value` | `string` | `""`    | Every keystroke (controlled). |

### `CreateBoardModal` (planned)
| State          | Type     | Initial         | Trigger                     |
|----------------|----------|-----------------|-----------------------------|
| `title`        | `string` | `""`            | Input keystroke.            |
| `category`     | enum     | `"CELEBRATION"` | Select change.              |
| `author`       | `string` | `""`            | Input keystroke.            |
| `imageUrl`     | `string` | `""`            | Input keystroke. Required.  |
| `isSubmitting` | `bool`   | `false`         | Around API call.            |
| `errorMessage` | `string?`| `null`          | Set on error.               |

### `BoardPage` (planned)
| State                   | Type            | Initial | Trigger                              |
|-------------------------|-----------------|---------|--------------------------------------|
| `board`                 | `Board \| null` | `null`  | Fetch on mount / param change.       |
| `cards`                 | `Card[]`        | `[]`    | From fetch; mutated by CRUD/upvote.  |
| `isCreateCardModalOpen` | `bool`          | `false` | Button click / successful create.    |

### `CreateCardModal` (planned)
| State            | Type            | Initial | Trigger                             |
|------------------|-----------------|---------|-------------------------------------|
| `title`          | `string`        | `""`    | Input keystroke. Required.          |
| `message`        | `string`        | `""`    | Textarea keystroke.                 |
| `author`         | `string`        | `""`    | Input keystroke.                    |
| `selectedGifUrl` | `string \| null`| `null`  | `GiphySearch` → `onSelectGif`.      |
| `isSubmitting`   | `bool`          | `false` | Around API call.                    |
| `errorMessage`   | `string?`       | `null`  | Set on error.                       |

### `GiphySearch` (planned)
| State        | Type      | Initial | Trigger                    |
|--------------|-----------|---------|----------------------------|
| `gifQuery`   | `string`  | `""`    | Input keystroke.           |
| `gifResults` | `array`   | `[]`    | Set after GIPHY response.  |
| `isLoading`  | `bool`    | `false` | While request in flight.   |

---

## 5. What the backend needs to deliver

The frontend is currently mocking every one of these. When the backend is up, we swap `filterBoards()` / local state mutation for real `fetch` calls. Contract details in [planning.md](planning.md) section 2.

### 5.1 Data models (must match what frontend renders)

**`Board`** — used by `BoardCard`, `BoardsSection`, `BoardPage`:
```
{
  id: string,
  title: string,           // shown as card title
  category: "CELEBRATION" | "THANK_YOU" | "INSPIRATION",
  imageUrl: string,        // REQUIRED — used as the card's image
  author: string | null,   // optional
  createdAt: ISO string    // used for "recent" filter
}
```

**`Card`** — used by `CardTile` on the board detail page:
```
{
  id: string,
  boardId: string,
  title: string,           // REQUIRED per new brief (in addition to message)
  message: string,
  gifUrl: string,          // GIPHY URL
  author: string | null,
  upvotes: number,
  createdAt: ISO string
}
```

### 5.2 Endpoints the frontend calls

Base URL comes from `VITE_API_URL` env var (default `http://localhost:3000/api`). All responses JSON.

| Method + path                          | What the frontend does with it                                            | Query / body                                                                            | Returns                             |
|----------------------------------------|---------------------------------------------------------------------------|------------------------------------------------------------------------------------------|-------------------------------------|
| `GET /boards`                          | `HomePage` fetches on mount + on filter/search change.                    | `?category=...` / `?filter=recent` / `?search=...` (any combination)                     | `Board[]`                           |
| `POST /boards`                         | `CreateBoardModal` submit.                                                | `{ title, category, imageUrl, author? }`                                                 | `Board` (the created one)           |
| `GET /boards/:id`                      | `BoardPage` fetches on mount / param change.                              | —                                                                                        | `Board & { cards: Card[] }`         |
| `DELETE /boards/:id`                   | `BoardCard` delete button (with confirm).                                 | —                                                                                        | `204`                               |
| `POST /boards/:boardId/cards`          | `CreateCardModal` submit.                                                 | `{ title, message, gifUrl, author? }`                                                    | `Card` (the created one)            |
| `DELETE /cards/:id`                    | `CardTile` delete button.                                                 | —                                                                                        | `204`                               |
| `PATCH /cards/:id/upvote`              | `CardTile` upvote button. Increments by 1.                                | —                                                                                        | `Card` (updated)                    |
| `GET /giphy/search?q=`                 | `GiphySearch` typeahead. Proxies GIPHY so the API key stays server-side.  | `?q=...`                                                                                 | array of `{ id, url, previewUrl }`  |

### 5.3 Filtering / searching rules

Frontend just passes query params; backend does the work:

- `?category=CELEBRATION` (or `THANK_YOU`, `INSPIRATION`) → return only boards in that category.
- `?filter=recent` → return only the 6 most-recently-created boards (ignores category if both given).
- `?search=summer` → case-insensitive substring match on `Board.title`.
- Combine `category` + `search`: apply both.
- No params: return all boards.

Sort order (when not explicitly filtered): `createdAt` descending.

### 5.4 Errors

- All 4xx / 5xx should return `{ "error": "human-readable message" }` so the frontend can surface it in the modal's `errorMessage`.
- CORS must allow the Vite dev origin (usually `http://localhost:5173`). Configure via `FRONTEND_ORIGIN` env var so it can be pointed at prod later.

### 5.5 Environment / auth

- Frontend needs `VITE_API_URL` set at build time. If unset, defaults to `http://localhost:3000/api`.
- Auth (`log in` / `register` buttons) is not spec'd yet — the buttons currently do nothing. When we add auth, the backend will need `POST /auth/register`, `POST /auth/login`, and either sessions or JWT.

### 5.6 Contract diffs from the base spec

Two things in [planning.md](planning.md) need updating before implementation — both raised by the new brief:

1. **`Board.imageUrl` must be required** (spec currently has it optional).
2. **`Card.title` field must be added** (spec currently only has `message`). `POST /boards/:boardId/cards` needs `title` in the request body.

---

## 6. API client shape

`src/lib/api.js` will export thin wrappers around `fetch`:

```js
export async function getBoards({ category, filter, search } = {}) { ... }
export async function createBoard(payload) { ... }
export async function getBoard(id) { ... }
export async function deleteBoard(id) { ... }
export async function createCard(boardId, payload) { ... }
export async function deleteCard(id) { ... }
export async function upvoteCard(id) { ... }
export async function searchGiphy(query) { ... }
```

Each throws on non-2xx so components can `try/catch` in submit handlers.

---

## 7. Build order (recommended)

1. Install `react-router-dom`, wire routes.
2. API client with mock returns.
3. Wire `HomePage` fetch on mount → replace `realBoards.js` usage.
4. Move filter + search to query params (drop client-side `filterBoards`).
5. `CreateBoardButton` + `CreateBoardModal` — form + submit + optimistic prepend.
6. Real delete on `BoardCard` (currently just splices local state).
7. `BoardPage` — route, fetch, `BoardPageHeader`, `CardGrid`, `CardTile`.
8. `CreateCardModal` + `GiphySearch`.
9. Upvote + delete card.
10. Empty / loading states + responsive polish.
