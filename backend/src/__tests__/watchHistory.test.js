import request from "supertest"
import { getApp } from "./setup.js"
import { createTestUser, createTestVideo, getAuthTokens } from "./helpers/testHelpers.js"

describe("Watch History API", () => {
    let app

    beforeAll(async () => {
        app = await getApp()
    })

    describe("GET /api/v1/users/watch-history", () => {
        it("should return empty array when user has no watch history", async () => {
            const user = await createTestUser({ username: "whempty", email: "whempty@example.com" })
            const { accessToken } = await getAuthTokens(user)

            const res = await request(app)
                .get("/api/v1/users/watch-history")
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toBeDefined()
            expect(Array.isArray(res.body.data)).toBe(true)
            expect(res.body.data.length).toBe(0)
        })

        it("should return watch history after user watches a video", async () => {
            const user = await createTestUser({ username: "whwatcher", email: "whwatcher@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const video = await createTestVideo(user._id, { title: "Watched Video" })

            await request(app)
                .get(`/api/v1/videos/${video._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            const res = await request(app)
                .get("/api/v1/users/watch-history")
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeDefined()
            expect(Array.isArray(res.body.data)).toBe(true)
            expect(res.body.data.length).toBeGreaterThanOrEqual(1)
            const watchedVideo = res.body.data.find((v) => v._id === video._id.toString())
            expect(watchedVideo).toBeDefined()
            expect(watchedVideo.title).toBe("Watched Video")
        })

        it("should return 401 when unauthenticated", async () => {
            const res = await request(app).get("/api/v1/users/watch-history")
            expect(res.status).toBe(401)
        })
    })
})
