# Admin Panel - Quick Setup & Run

Prerequisites
- Node.js 16+ and npm
- Backend API running (default http://localhost:8800)

Install
```bash
cd admin
npm install
```

Environment
- Optional: create `.env` in `admin/` to set `REACT_APP_API_URL` (defaults to `http://localhost:8800/api`).

Run (development)
```bash
cd admin
npm start
```

Build (production)
```bash
cd admin
npm run build
```

Notes & Troubleshooting
- The admin app uses a proxy to the API (`proxy` in package.json). If API runs on another host/port set `REACT_APP_API_URL`.
- If you see module-not-found for components, ensure `client/src/components/searchItem/SearchItem.jsx` exists (used by client; unrelated to admin) and run `npm install` again.
- If authentication issues occur, confirm `token` saved in `localStorage` after login.

Useful commands
- `npm start` : dev server
- `npm run build` : production build

Git Push
```bash
cd admin
git add .
git commit -m "update: admin changes"
git push origin main
```

Contact
- See project root docs for more details.