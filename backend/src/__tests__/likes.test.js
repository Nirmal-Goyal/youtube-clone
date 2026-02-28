import request from "supertest"
import { getApp } from "./setup.js"
import { createTestUser, createTestVideo, getAuthTokens } from "./helpers/testHelpers.js"

describe("Likes API", () => {
    let app

    beforeAll(async () => {
        app = await getApp()
    })

    describe("POST /api/v1/videos/:videoId/likes", () => {
        it("should toggle video like", async () => {
            const user = await createTestUser({ username: "liker", email: "like@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const video = await createTestVideo(user._id)

            const res = await request(app)
                .post(`/api/v1/videos/${video._id}/likes`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data.liked).toBe(true)
            expect(typeof res.body.data.likesCount).toBe("number")
        })

        it("should unlike when toggling again", async () => {
            const user = await createTestUser({ username: "unliker", email: "unlike@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const video = await createTestVideo(user._id)

            await request(app)
                .post(`/api/v1/videos/${video._id}/likes`)
                .set("Authorization", `Bearer ${accessToken}`)

            const res = await request(app)
                .post(`/api/v1/videos/${video._id}/likes`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data.liked).toBe(false)
        })
    })
})
