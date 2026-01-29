# Client - Quick Setup & Run

Prerequisites
- Node.js 16+ and npm
- Backend API running (default http://localhost:8800)

Install
```bash
cd client
npm install
```

Environment
Create `.env` in `client/` if you need to override API base URL:
```
REACT_APP_API_URL=http://localhost:8800/api
```

Run (development)
```bash
cd client
npm start
```

Build (production)
```bash
cd client
npm run build
```

Troubleshooting
- `Module not found` for `SearchItem`: ensure `client/src/components/searchItem/SearchItem.jsx` exists. If missing, restore it from project docs or run `git checkout -- client/src/components/searchItem/SearchItem.jsx`.
- `Proxy` is set in `package.json` to `http://localhost:8800/api`. If API path differs, set `REACT_APP_API_URL` and use `client/src/utils/axiosInstance.js`.
- CORS errors: check API `cors()` middleware and client `REACT_APP_API_URL` value.

Useful Commands
- `npm start` : run dev server
- `npm run build` : build production bundle

Git Push
```bash
cd client
git add .
git commit -m "update: client changes"
git push origin main
```

Contact
- See `client/src/utils/axiosInstance.js` for how HTTP requests are configured.