import { jest } from "@jest/globals"
import dotenv from "dotenv"
import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { DB_NAME } from "../constant.js"
import { fileURLToPath } from "url"
import path from "path"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load test env first
dotenv.config({ path: path.join(process.cwd(), ".env.test") })
process.env.NODE_ENV = "test"

// Mock Cloudinary before any imports that use it
await jest.unstable_mockModule("../utils/cloudinary.js", () => ({
    uploadOnCloudinary: jest.fn().mockResolvedValue({
        url: "https://test.com/avatar.png",
        public_id: "test_avatar_id",
    }),
    uploadVideoOnCloudinary: jest.fn().mockResolvedValue({
        url: "https://test.com/video.mp4",
        public_id: "test_video_id",
    }),
    deleteFromCloudinary: jest.fn().mockResolvedValue({ result: "ok" }),
}))

let mongoServer

beforeAll(async () => {
    if (process.env.USE_REAL_MONGODB !== "true") {
        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()
        process.env.MONGO_URI = uri
    }
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    // Ensure public/temp exists for multer
    const tempDir = path.join(process.cwd(), "public", "temp")
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
    }
}, 120000)

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect()
    }
    if (mongoServer) {
        await mongoServer.stop()
    }
})

beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
        const collections = await mongoose.connection.db.collections()
        for (const collection of collections) {
            if (!collection.collectionName.startsWith("system.")) {
                await collection.deleteMany({})
            }
        }
    }
})

let appCache = null

export async function getApp() {
    if (appCache) return appCache
    const { app } = await import("../app.js")
    appCache = app
    return app
}
