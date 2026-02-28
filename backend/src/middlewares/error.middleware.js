import { ApiError } from "../utils/ApiError.js"
import { ZodError } from "zod"

const errorHandler = (err, req, res, next) => {
    let statusCode = 500
    let message = "Something went wrong"
    let errors = []

    if (err instanceof ApiError) {
        statusCode = err.statusCode
        message = err.message
        errors = err.errors || []
    } else if (err instanceof ZodError) {
        statusCode = 400
        message = "Validation failed"
        const issues = err.issues || err.errors || []
        errors = issues.map((e) => ({
            field: (e.path && e.path.length) ? e.path.join(".") : "unknown",
            message: e.message || "Invalid"
        }))
    } else if (err.name === "ValidationError") {
        statusCode = 400
        message = "Validation failed"
        errors = Object.values(err.errors || {}).map((e) => ({
            field: e.path,
            message: e.message
        }))
    } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        statusCode = 401
        message = err.message || "Invalid or expired token"
    } else {
        if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
            console.error(err)
        }
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors: errors.length ? errors : undefined
    })
}

export { errorHandler }
