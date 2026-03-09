# Lively Votes

Real-time polling application built to learn and experiment with **WebSockets**.

## Tech Stack

**Backend**

- Express
- Supabase (Auth + Database)
- Drizzle ORM
- Socket.IO

**Frontend**

- React
- Emotion (CSS-in-JS)
- Material-UI (MUI)
- TanStack Query (React Query)
- React Router

## Features

Special things I implemented (many for the first time):

- Supabase Authentication (email/password + refresh tokens handled by Supabase)
- Material-UI component library
- Optimistic updates for voting
- Infinite scrolling / pagination for polls list (TanStack Query)
- Real-time vote updates using WebSockets (Socket.IO)
- Previously: manual refresh token logic → now delegated to Supabase

## Quick Start

### Backend Setup

```bash
cd backend

# Create .env file
cp .env.example .env    # or manually create it
```

**.env** example:

```env
DATABASE_URL="postgresql://postgres:yourpassword@db.your-project.supabase.co:5432/postgres"

# How many polls to load per page (recommend 10–20)
NUMBER_OF_ROWS_PER_RES=15

# Comma separated – very important for Socket.IO & CORS
ALLOWED_ORIGINS=http://localhost:5173,https://your-deployed-frontend.com

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Frontend Setup

```bash
cd frontend

# Create .env file
touch .env
```

**.env** example:

```env
# Vite uses VITE_ prefix for client-exposed variables
VITE_URL_WHEN_DEV=http://localhost:3000
VITE_URL_WHEN_PROD=https://your-backend-domain.com
```

```bash
# Install dependencies
npm install

# Start dev server (usually opens at http://localhost:5173)
npm run dev
```

## How It Works (High Level)

1. Frontend makes HTTP requests to Express backend
2. Backend forwards most data operations to **Supabase**
3. Authentication is handled completely by **Supabase Auth** (no manual JWT verification anymore)
4. When a vote is cast → backend uses **Socket.IO** to broadcast the update to everyone viewing that poll
5. Frontend uses TanStack Query + optimistic updates for smooth UX

## Project Structure

```
lively-votes/
├── backend/
│   ├── controllers/         → business logic
│   ├── db/                  → Drizzle schema + seed script
│   ├── drizzle/             → migrations
│   ├── routes/              → Express route handlers
│   ├── utils/               → helpers (Supabase client, error handling…)
│   ├── app.js
│   ├── drizzle.config.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/          → reusable pieces (Poll card, Navbar…)
    │   ├── context/             → Auth context
    │   ├── hooks/               → custom hooks (useLogin, useCastVote…)
    │   │   ├── authentication/
    │   │   ├── axios/
    │   │   ├── polls/
    │   │   ├── profile/
    │   │   └── socket/
    │   ├── pages/               → route-level pages
    │   ├── services/            → API calls + socket logic
    │   ├── ui/                  → low-level UI components (TextField…)
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/
    └── vite.config.js
```

## Future Improvements (Ideas)

- Add poll expiration / closing
- Multiple choice / ranked choice polls
- Better mobile responsiveness
- Dark mode toggle
- Poll results visualization (charts)

---

Made to understand WebSockets, Supabase + Drizzle, optimistic UI and real-time features.

Feel free to open issues / PRs!

---

## Thanks for visiting

---

#### Entire Project Structure (only for my understanding, feel free to skip this)

```
lively-votes/
├── Backend/
│   ├── .gitignore
│   ├── app.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── pollController.js
│   │   └── userController.js
│   ├── db/
│   │   ├── schema.js
│   │   └── script.js
│   ├── drizzle.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── routes/
│   │   ├── pollRoute.js
│   │   └── userRoutes.js
│   └── utils/
│       ├── appError.js
│       ├── catchAsync.js
│       └── supabase.js
└── Frontend/
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── public/
    │   └── vite.svg
    ├── README.md
    ├── src/
    │   ├── App.jsx
    │   ├── assets/
    │   │   └── react.svg
    │   ├── components/
    │   │   ├── AllPolls.jsx
    │   │   ├── CreatePoll.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── NavbarButton.jsx
    │   │   └── Poll.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   ├── authentication/
    │   │   │   ├── useLogin.js
    │   │   │   ├── useLogout.js
    │   │   │   └── useSignup.js
    │   │   ├── axios/
    │   │   │   └── useAxiosPrivate.js
    │   │   ├── polls/
    │   │   │   ├── useCastVote.js
    │   │   │   ├── useCountVotesForPoll.js
    │   │   │   ├── useCreatePoll.js
    │   │   │   ├── useGetPollById.js
    │   │   │   ├── useGetPollsWithPagination.js
    │   │   │   └── useWhichOptionVoted.js
    │   │   ├── profile/
    │   │   │   ├── useGetPollsUserHaveVotedIn.js
    │   │   │   ├── useGetPollsUserHaveVotedInWithPagination.js
    │   │   │   └── useGetProfileData.js
    │   │   └── socket/
    │   │       └── useSocketInvalidation.js
    │   ├── index.css
    │   ├── main.jsx
    │   ├── pages/
    │   │   ├── AppLayout.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── PollPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   └── SignupPage.jsx
    │   ├── services/
    │   │   ├── apiAuthentication.js
    │   │   ├── apiConfig.js
    │   │   ├── apiPolls.js
    │   │   ├── apiUser.js
    │   │   └── socket.js
    │   └── ui/
    │       └── TextField.jsx
    └── vite.config.js
```
