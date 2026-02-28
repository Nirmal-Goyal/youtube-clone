# YouTube Clone

A full-stack YouTube clone project with a REST API backend. The backend is production-ready; a frontend can be added later.

## Tech Stack

- **Node.js** + **Express** – REST API
- **MongoDB** – Database
- **Cloudinary** – Video and image storage

## Repository Structure

```
youtube-clone/
└── backend/     # REST API (Node.js, Express, MongoDB, Cloudinary)
```

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, Cloudinary credentials
npm run dev
```

The API will be available at `http://localhost:8000`.

## Documentation

For detailed setup, environment variables, API routes, and testing, see [backend/README.md](backend/README.md).
