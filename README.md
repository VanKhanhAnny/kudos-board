## Unit Assignment: Kudos Board

Submitted by: **Anny Dang, Eric Wong, and Enes Bilek**

Deployed Application (optional): Not deployed this time.

### Application Features

#### CORE FEATURES

##### Home Page

- [x] **Home Page Display**
  - [x] Home page includes the following features:
    - [x] Header
    - [x] Banner
    - [x] Search bar
    - [x] List of boards
    - [x] Footer
- [x] **Display Boards**
  - [x] Users can view a list of all boards in a grid view on the home page.
  - [x] For each board displayed, users can see:
    - [x] An image/gif
    - [x] A board title
- [x] **Filter Boards**
  - [x] Home page includes navigation bar, drop down, or some other mechanism which allows users to filter boards by the following categories:
    - [x] All/Home (displays all boards)
    - [x] Recent (displays the 6 most recently created boards)
    - [x] Celebration
    - [x] Thank you
    - [x] Inspiration
  - [x] When a category is clicked, boards matching the specified category are displayed.
- [x] **Search Functionality**
  - [x] Users can use a search bar to search for boards by title on the home page.
  - [x] The search bar should include:
    - [x] Text input field
    - [x] Submit/Search Button
    - [x] Clear Mechanism
  - [x] Boards with a title containing the search query in the text input field are displayed in a grid view when the user:
    - [x] Presses the Enter key
    - [x] Clicks the Submit/Search button 
  - [x] User can delete all text from the text input field. 
  - [x] When all text is cleared from the text input field, all boards are displayed in a grid view
- [x] **View Board** 
  - [x] Users can click on a board in the grid view to navigate to a new page containing that board's details.
- [x] **Add New Board**
  - [x] Users can create a new board on the home page.
  - [x] When creating a new board, users can specify the:
    - [x] Title (required)
    - [x] Category (required)
    - [x] Author (optional)
  - [x] Items listed as required above must have a value to successfully create a new board.
  - [x] When the board is successfully created, it appears in the grid of boards. 
- [x] **Delete Board**
  - [x] User can delete boards on the home page. 
  - [x] When the board is deleted, the board disappears from the grid of boards. 

##### Board Page

- [x] **Display Cards**
  - [x] For a given board, the board's page displays a list of all cards for that board in a grid view.
  - [x] For each card should displayed, users can see the card's:
    - [x] Message
    - [x] Gif 
    - [x] Number of upvotes
    - [x] Delete button
- [x] **Add New Card**
  - [x] Users can make a new card associated with the current board. 
  - [x] To successfully create a new card, users must specify the following:
    - [x] Text message (required).
    - [x] A gif users can search for and select within the form using the [GIPHY API](https://developers.giphy.com/docs/api/) (required).
  - [x] Users are given the option to specify the author of the card.
  - [x] When the new card is successfully created, it appears in the grid of cards. 
- [x] **Upvote Card**
  - [x] Users can upvote a card.
  - [x] Update the vote count on the card tile when a user clicks the upvote icon.
  - [x] When the upvote icon is clicked the upvote count increases by 1. 
  - [x] A user can upvote a card multiple times. 
- [x] **Delete Card**
  - [x] Users can delete cards.
  - [x] When the user clicks the delete button for a card, the card disappears from the grid of cards. 


####  Stretch Features

- [ ] **Deployment**
  - [ ] Website is deployed via Render.
- [ ] **Comments**
  - [ ] Users can add comments to cards.
  - [ ] To successfully add a comment, users must specify a text message body.
  - [ ] Users are given the option to specify the author of the comment.
  - [ ] Users can view comments on card in a pop-up modal that displays the card's:
    - [ ] Text message 
    - [ ] Gif
    - [ ] Author (if specified)
    - [ ] A list of the card's comments and each comment's:
      - [ ] Message body
      - [ ] Author (if specified)
  - [ ] Users can add multiple comments to a single card.
- [ ] **Dark Mode** 
  - [ ] Users can toggle between light mode and dark mode using a button displayed on the:
    - [ ] Home Page
    - [ ] Board Pages
  - [ ] When the button is clicked, the color theme switches to the opposite of the current mode. 
  - [ ] When dark mode is enabled:
    - [ ] Text and icons use a light color
    - [ ] The background uses a dark color
    - [ ] Color contrast has at least a 4.5:1 ratio using this [color contrast checker](https://webaim.org/resources/contrastchecker/)
  - [ ] When light mode is enabled:
    - [ ] Text and icons use a dark color
    - [ ] The background uses a light color
    - [ ] Color contrast has at least a 4.5:1 ratio using this [color contrast checker](https://webaim.org/resources/contrastchecker/)
  - [ ] The chosen mode (light or dark) persists when navigating from home page to board pages and vice versa.
  - [ ] When the user first visits the site the theme defaults to light mode.
  - [ ] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS**: To ease the grading process, please use the [color contrast checker](https://webaim.org/resources/contrastchecker/) to demonstrate to the grading team that text and background colors on your website have appropriate contrast in both light and dark mode. The Contrast Ratio should be above 4.5:1 and should have a green box surrounding it. 
- [ ] **Pinned Cards**
  - [ ] Users can pin a card to the top of the board.
  - [ ] A Pin button is displayed on each card.
  - [ ] When the user clicks the Pin button of an unpinned card:
    - [ ] The card moves to the top of the grid view for that board.
    - [ ] There is some visual feedback to indicate a card's pin status (e.g., a pin icon, a border highlight).
    - [ ] The pin action is saved so that the card remains pinned after page refreshes.
  - [ ] When the user clicks the Pin button of a pinned card:
    - [ ] The card returns to its original position in the grid based on its creation time or to the end of the grid.
    - [ ] The card's pin status (e.g., a pin icon or highlight)  is removed.
    - [ ] The unpin action is saved so that the card remains unpinned after page refresh.
  - [ ] Pinned cards always appear at the top of the board, above unpinned cards.
  - [ ] If multiple cards are pinned, they maintain their pinned order based on the time they were pinned.
    - [ ] More recent pins should appear first.
- [ ] The pinned state of a card persists when:
  - [ ] navigating away from and back to the board.
  - [ ] refreshing the page. 
- [x] **User Accounts**
  - [x] Users should be able to log in with a username and password.
  - [x] Users should be able to sign up for a new account.
  - [x] Boards and cards should be associated with a user.
    - [x] Anonymous cards or cards by guest users should still be allowed.
  - [x] Add a new filter option on the home page to display only the current user's boards.
  - [x] Allow boards to be deleted only if they are owned by the user.


### Walkthrough Video

`TODO://` Paste the **shareable link** to your animated app walkthrough below (replace `ADD_LOOM_LINK_HERE`). GitHub markdown won't render an embedded Loom player, so a plain link is what graders will use. Make sure the link is public and playable before submitting. Ensure your walkthrough showcases the presence and/or functionality of all features you implemented above (check them off as you film!). Pay attention to any **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS** checkboxes listed above to ensure graders see the full functionality of your website. (🚫 Remove this paragraph after adding your walkthrough link.)

**Walkthrough video:** [Kudos Board Walkthrough](ADD_LOOM_LINK_HERE)

### Reflection

* Did the topics discussed in your labs prepare you to complete the assignment? Be specific, which features in your weekly assignment did you feel unprepared to complete?

The labs covered enough of the basics — React components + hooks, an Express router with Prisma, and the general shape of a JSON API — that scaffolding the CORE features was largely mechanical. The parts where the labs left the biggest gap were the ones with the most real-world integration friction: (1) CORS between the Vite dev server and Express, which we hit as soon as we tried the first cross-origin fetch and had to figure out `FRONTEND_ORIGIN`; (2) the GIPHY API — the labs never covered a third-party client-side API integration, so debating "backend proxy vs. direct browser call" and settling on `VITE_GIPHY_API_KEY` in `frontend/.env` was on us; and (3) the User Accounts stretch, which required auth patterns (JWT signing, bcrypt cost factor, bearer-token middleware, rehydrate-from-localStorage) that the labs didn't touch at all. The stretch on user accounts felt the most "you're on your own" of anything we built.

* If you had more time, what would you have done differently? Would you have added additional features? Changed the way your project responded to a particular event, etc.

Two things. First, I'd finish the two stretch features we cut — Comments (the model + routes are a fairly clean addition, but the UI polish of a comments modal is more work than it looked) and Dark Mode (a `ThemeProvider` + CSS-variable palette swap is uncomplicated but touches every component). We also *built* Pinned Cards on the backend and then removed it — in hindsight, we should have driven the frontend UI at the same time so we'd have a signal on whether the feature was actually worth the schema surface. Second, I'd invest earlier in a shared testing harness — the Postman collections were good for the endpoint acceptance tests, but we caught bugs like the nested-`<form>` regression (frontend `CreateCardModal` submitting on GIPHY search click) and the stale-Prisma-client-post-migration issue only during manual integration. A small Playwright or Vitest+MSW harness would have paid for itself.

* Reflect on your project demo, what went well? Were there things that maybe didn't go as planned? Did you notice something that your peer did that you would like to try next time?

What went well: the three-way work split (Anny frontend, Eric backend foundation + boards, Enes cards) held up because we spec'd the API contract before anyone wrote code — Sections 2 and 3 of `planning.md`. That let all three of us work in parallel with essentially zero merge conflicts on the route files. What didn't go as planned: the API contract still drifted from reality mid-project (see the two "Spec change" notes at the bottom of `planning.md` — Pinned Cards removed, User Accounts added later) and we had to reconcile in Milestone 3 rather than as we went. Next time I'd enforce the "spec-parity rule" more strictly — any PR that touches an endpoint has to touch the contract in the same commit, no follow-ups.

### Open-source libraries used

Frontend:
- [React](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)

Backend:
- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/) (`prisma`, `@prisma/client`, `@prisma/adapter-pg`)
- [PostgreSQL](https://www.postgresql.org/) (via [`pg`](https://node-postgres.com/))
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [cors](https://github.com/expressjs/cors)
- [morgan](https://github.com/expressjs/morgan)
- [dotenv](https://github.com/motdotla/dotenv)
- [nodemon](https://nodemon.io/) (dev only)

External API:
- [GIPHY API](https://developers.giphy.com/docs/api/) — called directly from the browser.

### Shout out

All the instructors + Ava, Zainab, and all those who offered feedback during the demo. Also Dallas and Lakshmi, who are mine and Anny's mentors, for offering valuable UI feedback during this weeks pod sync.