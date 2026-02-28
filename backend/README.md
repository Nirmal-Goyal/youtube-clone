# YouTube Clone Backend

REST API backend for a YouTube clone built with Node.js, Express, MongoDB, and Cloudinary.

## Prerequisites

- **Node.js** 18 or higher
- **MongoDB** (local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Cloudinary** account (for video/image uploads)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your values:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your MongoDB URI, JWT secrets, Cloudinary credentials, and other settings.

3. Ensure MongoDB is running locally, or use a MongoDB Atlas connection string in `MONGO_URI`.

4. Start the development server:

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:8000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with nodemon (auto-reload) |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 8000) |
| `NODE_ENV` | Environment (`development`, `test`, `production`) |
| `MONGO_URI` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | JWT access token secret (min 32 chars) |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret (min 32 chars) |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry (e.g. `1d`) |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry (e.g. `7d`) |
| `CORS_ORIGIN` | Allowed origins (comma-separated or `*`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms (optional) |
| `RATE_LIMIT_MAX` | Max requests per window (optional) |
| `RATE_LIMIT_AUTH_MAX` | Max auth requests per window (optional) |

See `.env.example` for a full template.

## API Overview

Base URL: `http://localhost:8000/api/v1`

| Route | Description |
|-------|-------------|
| `/health` | Health check |
| `/users` | Auth, profile, watch history |
| `/videos` | CRUD, streaming, likes, comments |
| `/comments` | Add, list, update, delete comments |
| `/subscriptions` | Subscribe, unsubscribe, list |
| `/playlists` | CRUD, add/remove videos |
| `/search` | Search videos, channels, playlists |

## Testing

Tests use `NODE_ENV=test` and MongoDB Memory Server by default. You can use a `.env.test` file for test-specific configuration.

```bash
npm test
```

## Project Structure

```
src/
├── controllers/    # Request handlers
├── routes/        # API route definitions
├── models/        # Mongoose models
├── middlewares/   # Auth, validation, rate limiting, etc.
├── validations/   # Zod schemas
├── db/            # Database connection
├── utils/         # Helpers (ApiResponse, asyncHandler, etc.)
├── __tests__/     # Jest tests
├── app.js         # Express app setup
├── index.js       # Entry point
└── constant.js    # App constants
```
