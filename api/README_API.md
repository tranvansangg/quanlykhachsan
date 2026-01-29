# API - Quick Setup & Run

Prerequisites
- Node.js 16+ and npm
- MongoDB connection URI (set in `.env` as `MONGO`)

Install
```bash
cd api
npm install
```

Environment
Create `.env` in `api/` with at least:
```
MONGO=mongodb://localhost:27017/your-db
JWT_SECRET=your_jwt_secret
```

Run
```bash
cd api
npm start
```

Notes
- Server listens on port 8800 by default (`api/index.js`).
- Uses `cors()` and `express.json()`; if client runs on different host make sure CORS is allowed.
- Logs and errors will be printed to console by nodemon.

Common Issues
- `MongoNetworkError`: check MongoDB URI and that mongod is running.
- `E11000 duplicate key`: unique index conflict when seeding data.

Testing endpoints
- Use `http://localhost:8800/api/` routes (examples in repo docs).

Git Push
```bash
cd api
git add .
git commit -m "update: api changes"
git push origin main
```

Contact
- See `api/` controllers and routes for available endpoints.