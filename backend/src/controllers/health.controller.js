import mongoose from "mongoose"

const getHealth = (req, res) => {
    const dbOk = mongoose.connection.readyState === 1
    const cloudinaryConfigured =
        !!process.env.CLOUDINARY_CLOUD_NAME &&
        !!process.env.CLOUDINARY_API_KEY &&
        !!process.env.CLOUDINARY_API_SECRET

    const services = {
        database: dbOk ? "ok" : "down",
        cloudinary: cloudinaryConfigured ? "ok" : "unconfigured",
    }

    let status
    let statusCode
    if (dbOk) {
        status = cloudinaryConfigured ? "ok" : "degraded"
        statusCode = 200
    } else {
        status = "down"
        statusCode = 503
    }

    res.status(statusCode).json({
        success: true,
        status,
        timestamp: new Date().toISOString(),
        services,
    })
}

export { getHealth }
