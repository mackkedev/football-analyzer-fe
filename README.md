# Football Analyzer — Frontend

React frontend for the MatchIQ football prediction platform. Displays AI-generated match analysis, Stryktipset coupons, and prediction accuracy stats.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- The backend API running on `http://localhost:8080`

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app runs at **http://localhost:5173**. All `/api` requests are proxied to `http://localhost:8080`, so the backend must be running for data to load.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (output in `dist/`) |
| `npm run preview` | Preview the production build locally |

## Project structure

```
src/
  components/       # Shared components (Layout, MatchCard, LeagueFilter)
  pages/            # One file per route (Dashboard, MatchDetail, Accuracy, Admin, Stryktipset*)
  services/
    api.js          # Axios API functions
    constants.js    # League metadata, formatters, confidence helpers
  main.jsx          # App entry point
  index.css         # Global CSS variables and base styles
```

## Tech stack

- React 18 + React Router v6
- Vite
- Axios (proxied to backend at port 8080)
- Recharts, Framer Motion, Lucide React
- Plain CSS with custom properties (dark midnight theme)
