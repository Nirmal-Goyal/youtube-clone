import rateLimit from "express-rate-limit"

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000 // 15 minutes
const GLOBAL_MAX = Number(process.env.RATE_LIMIT_MAX) || 100
const AUTH_MAX = Number(process.env.RATE_LIMIT_AUTH_MAX) || 5

const rateLimitHandler = (req, res) => {
    res.status(429).json({
        success: false,
        message: "Too many requests, please try again later"
    })
}

const skipInTest = (req) => process.env.NODE_ENV === "test"

export const globalLimiter = rateLimit({
    windowMs: WINDOW_MS,
    limit: GLOBAL_MAX,
    skip: skipInTest,
    standardHeaders: true,
    handler: rateLimitHandler
})

export const authLimiter = rateLimit({
    windowMs: WINDOW_MS,
    limit: AUTH_MAX,
    skip: skipInTest,
    standardHeaders: true,
    handler: rateLimitHandler
})
