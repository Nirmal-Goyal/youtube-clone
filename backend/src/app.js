import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { ApiError } from "./utils/ApiError.js"
import { errorHandler } from "./middlewares/error.middleware.js"
import { globalLimiter, authLimiter } from "./middlewares/rateLimit.middleware.js"
import healthRouter from "./routes/health.routes.js"
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import { commentActionsRouter } from "./routes/comment.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import searchRouter from "./routes/search.routes.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/v1/health", healthRouter)
app.use("/api/v1", globalLimiter)
app.use("/api/v1/users/login", authLimiter)
app.use("/api/v1/users/register", authLimiter)
app.use("/api/v1/users/refresh-token", authLimiter)

app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentActionsRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/playlists", playlistRouter)
app.use("/api/v1/search", searchRouter)

app.all("/{*path}", (req, res, next) => {
    next(new ApiError(404, "Route not found"))
})

app.use(errorHandler)

export {app}