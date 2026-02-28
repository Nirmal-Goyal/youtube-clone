import request from "supertest"
import { getApp } from "./setup.js"
import { createTestUser, createTestVideo, getAuthTokens } from "./helpers/testHelpers.js"
import { createTestComment } from "./helpers/commentHelpers.js"

describe("Comments API", () => {
    let app

    beforeAll(async () => {
        app = await getApp()
    })

    describe("POST /api/v1/videos/:videoId/comments", () => {
        it("should add comment with auth and content", async () => {
            const user = await createTestUser({ username: "commenter", email: "comment@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const video = await createTestVideo(user._id)

            const res = await request(app)
                .post(`/api/v1/videos/${video._id}/comments`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ content: "Great video!" })

            expect(res.status).toBe(201)
            expect(res.body.data).toBeDefined()
            expect(res.body.data.content).toBe("Great video!")
        })

        it("should return 400 for empty content", async () => {
            const user = await createTestUser({ username: "emptycomment", email: "empty@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const video = await createTestVideo(user._id)

            const res = await request(app)
                .post(`/api/v1/videos/${video._id}/comments`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ content: "" })

            expect(res.status).toBe(400)
        })
    })

    describe("GET /api/v1/videos/:videoId/comments", () => {
        it("should get comments for video", async () => {
            const user = await createTestUser({ username: "getcomments", email: "getcomments@example.com" })
            const video = await createTestVideo(user._id)
            await createTestComment(video._id, user._id, "First comment")

            const res = await request(app).get(`/api/v1/videos/${video._id}/comments`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeDefined()
            expect(Array.isArray(res.body.data.docs)).toBe(true)
        })
    })

    describe("PATCH /api/v1/comments/:commentId", () => {
        it("should update comment when owner", async () => {
            const user = await createTestUser({ username: "updcomment", email: "updcomment@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const video = await createTestVideo(user._id)
            const comment = await createTestComment(video._id, user._id, "Original")

            const res = await request(app)
                .patch(`/api/v1/comments/${comment._id}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ content: "Updated content" })

            expect(res.status).toBe(200)
            expect(res.body.data.content).toBe("Updated content")
        })
    })

    describe("DELETE /api/v1/comments/:commentId", () => {
        it("should delete comment when owner", async () => {
            const user = await createTestUser({ username: "delcomment", email: "delcomment@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const video = await createTestVideo(user._id)
            const comment = await createTestComment(video._id, user._id)

            const res = await request(app)
                .delete(`/api/v1/comments/${comment._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
        })
    })
})
