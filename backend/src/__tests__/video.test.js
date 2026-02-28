import request from "supertest"
import path from "path"
import { fileURLToPath } from "url"
import { getApp } from "./setup.js"
import { createTestUser, createTestVideo, getAuthTokens } from "./helpers/testHelpers.js"
import mongoose from "mongoose"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const avatarPath = path.join(__dirname, "fixtures", "avatar.png")

describe("Video API", () => {
    let app

    beforeAll(async () => {
        app = await getApp()
    })

    describe("GET /api/v1/videos", () => {
        it("should get all videos without auth", async () => {
            const user = await createTestUser({ username: "videouser", email: "video@example.com" })
            await createTestVideo(user._id)

            const res = await request(app).get("/api/v1/videos")

            expect(res.status).toBe(200)
            expect(res.body.data).toBeDefined()
            expect(Array.isArray(res.body.data.docs)).toBe(true)
        })
    })

    describe("GET /api/v1/videos/:videoId", () => {
        it("should get video by valid ID", async () => {
            const user = await createTestUser({ username: "getvideo", email: "getvideo@example.com" })
            const video = await createTestVideo(user._id)

            const res = await request(app).get(`/api/v1/videos/${video._id}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeDefined()
            expect(res.body.data._id).toBe(video._id.toString())
        })

        it("should return 400 for invalid video ID", async () => {
            const res = await request(app).get("/api/v1/videos/invalid-id")

            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent video", async () => {
            const fakeId = new mongoose.Types.ObjectId()

            const res = await request(app).get(`/api/v1/videos/${fakeId}`)

            expect(res.status).toBe(404)
        })
    })

    describe("POST /api/v1/videos", () => {
        it("should publish video with auth and files", async () => {
            const user = await createTestUser({ username: "publisher", email: "publish@example.com" })
            const { accessToken } = await getAuthTokens(user)

            const res = await request(app)
                .post("/api/v1/videos")
                .set("Authorization", `Bearer ${accessToken}`)
                .field("title", "My Video")
                .field("description", "Video description")
                .field("duration", "120")
                .attach("videoFile", avatarPath, "video.mp4")
                .attach("thumbnail", avatarPath)

            expect(res.status).toBe(201)
            expect(res.body.data).toBeDefined()
            expect(res.body.data.title).toBe("My Video")
        })

        it("should return 400 for validation error (missing title)", async () => {
            const user = await createTestUser({ username: "invalidpub", email: "invalidpub@example.com" })
            const { accessToken } = await getAuthTokens(user)

            const res = await request(app)
                .post("/api/v1/videos")
                .set("Authorization", `Bearer ${accessToken}`)
                .field("description", "Desc")
                .field("duration", "60")
                .attach("videoFile", avatarPath, "video.mp4")
                .attach("thumbnail", avatarPath)

            expect(res.status).toBe(400)
        })
    })

    describe("PATCH /api/v1/videos/:videoId", () => {
        it("should update video when owner", async () => {
            const user = await createTestUser({ username: "updater", email: "update@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const video = await createTestVideo(user._id)

            const res = await request(app)
                .patch(`/api/v1/videos/${video._id}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ title: "Updated Title", description: "Updated desc" })

            expect(res.status).toBe(200)
            expect(res.body.data.title).toBe("Updated Title")
        })

        it("should return 403 when not owner", async () => {
            const owner = await createTestUser({ username: "owner", email: "owner@example.com" })
            const other = await createTestUser({ username: "other", email: "other@example.com" })
            const { accessToken } = await getAuthTokens(other)
            const video = await createTestVideo(owner._id)

            const res = await request(app)
                .patch(`/api/v1/videos/${video._id}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ title: "Hacked" })

            expect(res.status).toBe(403)
        })
    })

    describe("DELETE /api/v1/videos/:videoId", () => {
        it("should delete video when owner", async () => {
            const user = await createTestUser({ username: "deleter", email: "delete@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const video = await createTestVideo(user._id)

            const res = await request(app)
                .delete(`/api/v1/videos/${video._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
        })

        it("should return 403 when not owner", async () => {
            const owner = await createTestUser({ username: "delowner", email: "delowner@example.com" })
            const other = await createTestUser({ username: "delother", email: "delother@example.com" })
            const { accessToken } = await getAuthTokens(other)
            const video = await createTestVideo(owner._id)

            const res = await request(app)
                .delete(`/api/v1/videos/${video._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(403)
        })
    })
})
