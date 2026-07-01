# Kudos Board — Frontend Planning
**Stack:** Vite + React (JavaScript) + React Router

---

## 1. Current status

### Built (decorative hero — not yet wired to real data)
- `HomePage` shell with fixed hero layout: image grid background, dark overlay, "grateful" hero text, floating header.
- `BoardGrid` / `BoardCard`: dense 30×18 grid of mock tiles, 20% of tiles infinite-blink with brightness + glow halo.
- `HeroText`: sparkle + "grateful" word rendered as 4 stacked copies (sharp + 3 blur levels) with mask gradients for progressive blur; underline scoped inside `.hero-text__rateful` span.
- `Header`: nav pill (Home/Boards/Categories/About/Contact), search pill, user button with click-toggle dropdown (`useEffect` outside-click).
- Mock data: 16 JPGs in `public/`, 540 mock boards in `src/data/mockBoards.js` with random image assignment.

### Not yet built
- Wire `BoardGrid` / `BoardCard` to real board data (title, category, delete button, link to detail page). Same components as today — just more props.
- Category filter, search, create/delete board.
- Board detail page + cards.
- GIPHY search.
- API client (`src/lib/api.js`).
- Router setup (`react-router-dom` not yet installed).
---

## 2. Routes

```
/                    → HomePage      (hero + real board grid + filter + search)
/boards/:boardId     → BoardPage     (single board + cards)
```

Wrap in `<BrowserRouter>` inside `App.jsx`. Header + Footer render on every route.

---

## 3. Component tree (frontend only)

```
App
└── BrowserRouter
    ├── Header                            (always visible; floats over content)
    │   └── UserButton (with dropdown)
    ├── Routes
    │   ├── "/"        → HomePage
    │   │                ├── HeroSection                    (decorative)
    │   │                │   ├── BoardGrid                  (blinking tiles — reused for real data)
    │   │                │   │   └── BoardCard              (× N)
    │   │                │   └── HeroText                   ("grateful" + sparkle)
    │   │                ├── SearchBar
    │   │                ├── CategoryFilter
    │   │                ├── CreateBoardButton
    │   │                ├── CreateBoardModal               (conditional)
    │   │                └── BoardGrid                      (real boards, from API)
    │   │                    └── BoardCard                  (× N, links to /boards/:id)
    │   └── "/boards/:id" → BoardPage
    │                        ├── BoardPageHeader
    │                        ├── CreateCardButton
    │                        ├── CreateCardModal    (conditional)
    │                        │   └── GiphySearch
    │                        └── CardGrid
    │                            └── CardTile       (× N)
    └── Footer
```

One `BoardGrid` / `BoardCard` pair is used in both places — the hero variant just gets fed the mock tile array and no interaction props, while the real variant below gets real boards + `onDelete` + a `<Link>` wrapper. Same component, different props.

---

## 4. State (owned by frontend)

### `HomePage`
| State                    | Type                                                             | Initial | Trigger                                                        |
|--------------------------|------------------------------------------------------------------|---------|----------------------------------------------------------------|
| `boards`                 | `Board[]`                                                        | `[]`    | Fetch on mount + when `selectedCategory` / `searchQuery` changes; mutated by create/delete callbacks. |
| `selectedCategory`       | `"all" \| "recent" \| "CELEBRATION" \| "THANK_YOU" \| "INSPIRATION"` | `"all"` | `CategoryFilter` click.                                        |
| `searchQuery`            | `string`                                                         | `""`    | `SearchBar` submit / clear (**committed** value, not the input's local value). |
| `isCreateBoardModalOpen` | `boolean`                                                        | `false` | Button click / successful create.                              |

### `SearchBar`
| State        | Type     | Initial | Trigger                          |
|--------------|----------|---------|----------------------------------|
| `inputValue` | `string` | `""`    | Every keystroke (controlled).    |

Only becomes `searchQuery` in `HomePage` on submit.

### `CreateBoardModal`
| State          | Type                                              | Initial          | Trigger                              |
|----------------|---------------------------------------------------|------------------|--------------------------------------|
| `title`        | `string`                                          | `""`             | Input keystroke.                     |
| `category`     | `"CELEBRATION" \| "THANK_YOU" \| "INSPIRATION"`   | `"CELEBRATION"`  | Select change.                       |
| `author`       | `string`                                          | `""`             | Input keystroke.                     |
| `imageUrl`     | `string`                                          | `""`             | Input keystroke. **Required** per new brief. |
| `isSubmitting` | `boolean`                                         | `false`          | Toggled around API call.             |
| `errorMessage` | `string \| null`                                  | `null`           | Set on error, cleared on retry.      |

### `BoardPage`
| State                   | Type            | Initial | Trigger                                               |
|-------------------------|-----------------|---------|-------------------------------------------------------|
| `board`                 | `Board \| null` | `null`  | Fetch on mount / URL param change.                    |
| `cards`                 | `Card[]`        | `[]`    | From initial fetch; mutated by create/delete/upvote.  |
| `isCreateCardModalOpen` | `boolean`       | `false` | Button click / successful create.                     |

### `CreateCardModal`
| State            | Type             | Initial | Trigger                                             |
|------------------|------------------|---------|-----------------------------------------------------|
| `title`          | `string`         | `""`    | Input keystroke. **Required** per new brief.        |
| `message`        | `string`         | `""`    | Textarea keystroke.                                 |
| `author`         | `string`         | `""`    | Input keystroke.                                    |
| `selectedGifUrl` | `string \| null` | `null`  | `GiphySearch` calls `onSelectGif`.                  |
| `isSubmitting`   | `boolean`        | `false` | Toggled around API call.                            |
| `errorMessage`   | `string \| null` | `null`  | Set on error.                                       |

### `GiphySearch`
| State         | Type            | Initial | Trigger                                     |
|---------------|-----------------|---------|---------------------------------------------|
| `gifQuery`    | `string`        | `""`    | Input keystroke.                            |
| `gifResults`  | `GiphyResult[]` | `[]`    | Set after GIPHY response.                   |
| `isLoading`   | `boolean`       | `false` | While request is in flight.                 |

### Derived (not state)
- **Sorted cards** in `CardGrid`: derived from `cards` prop each render — pinned by `pinnedAt` desc, then unpinned by `createdAt` desc.
- **Filtered/searched boards**: pushed to backend via query params; frontend renders whatever comes back.

---

## 5. API client

All calls go through a thin wrapper in `src/lib/api.js`. Base URL from `VITE_API_URL` env var (default `http://localhost:3000/api`).

Endpoints the frontend consumes (see [planning.md](planning.md) for full contract):

| Method + path                     | Called by            | Returns                                |
|-----------------------------------|----------------------|----------------------------------------|
| `GET /boards?category=&filter=&search=` | `HomePage`         | `Board[]`                              |
| `POST /boards`                    | `CreateBoardModal`   | `Board`                                |
| `GET /boards/:id`                 | `BoardPage`          | `Board & { cards: Card[] }`            |
| `DELETE /boards/:id`              | `BoardCard`          | `204`                                  |
| `POST /boards/:boardId/cards`     | `CreateCardModal`    | `Card`                                 |
| `DELETE /cards/:id`               | `CardTile`           | `204`                                  |
| `PATCH /cards/:id/upvote`         | `CardTile`           | `Card`                                 |
| `GET /giphy/search?q=`            | `GiphySearch`        | `GiphyResult[]` (proxied — keeps API key server-side) |

**Contract diffs to raise with backend collaborator:**
- New brief requires `imageUrl` when creating a board → `POST /boards` request should require `imageUrl`.
- New brief requires `title` on cards → `Card` model needs a `title` field; `POST /boards/:boardId/cards` needs `title` in request body.

---

## 6. Build order (recommended)

1. **Install `react-router-dom`, wire `BrowserRouter` + routes.** Split the current `HomePage` into `HeroSection` (existing decorative build) + placeholder for real content below.
2. **API client** (`src/lib/api.js`) — thin `fetch` wrappers; use mock returns until backend is ready.
3. **Reuse `BoardGrid` / `BoardCard` for real boards below the hero.** Extend `BoardCard` with title, category, delete button, and a `<Link>` wrapper — driven by props so the hero variant stays as-is.
4. **Filter + Search** — `CategoryFilter`, `SearchBar`. Refetch on change.
5. **`CreateBoardModal`** — form + submit + optimistic prepend to `boards`.
6. **Delete board** — button on `BoardCard` with confirm.
7. **`BoardPage`** — route, fetch, `BoardPageHeader`, `CardGrid`, `CardTile`.
8. **`CreateCardModal` + `GiphySearch`.**
9. **Upvote + Delete card.**
10. **Responsive polish + empty states + loading states.**

Each step should work with mock data first, then swap to real API once backend endpoints are up.