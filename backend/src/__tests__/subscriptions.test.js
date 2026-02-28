import request from "supertest"
import { getApp } from "./setup.js"
import { createTestUser, createTestChannel, getAuthTokens } from "./helpers/testHelpers.js"

describe("Subscriptions API", () => {
    let app

    beforeAll(async () => {
        app = await getApp()
    })

    describe("POST /api/v1/subscriptions/:channelId", () => {
        it("should subscribe to channel", async () => {
            const user = await createTestUser({ username: "subscriber", email: "sub@example.com" })
            const channel = await createTestChannel({ username: "channel", email: "channel@example.com" })
            const { accessToken } = await getAuthTokens(user)

            const res = await request(app)
                .post(`/api/v1/subscriptions/${channel._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
            expect(res.body.message).toMatch(/subscribed|Subscribed/i)
        })
    })

    describe("DELETE /api/v1/subscriptions/:channelId", () => {
        it("should unsubscribe from channel", async () => {
            const user = await createTestUser({ username: "unsubber", email: "unsub@example.com" })
            const channel = await createTestChannel({ username: "ch2", email: "ch2@example.com" })
            const { accessToken } = await getAuthTokens(user)

            await request(app)
                .post(`/api/v1/subscriptions/${channel._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            const res = await request(app)
                .delete(`/api/v1/subscriptions/${channel._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
        })
    })

    describe("GET /api/v1/subscriptions", () => {
        it("should get subscribed channels", async () => {
            const user = await createTestUser({ username: "getsubs", email: "getsubs@example.com" })
            const channel = await createTestChannel({ username: "ch3", email: "ch3@example.com" })
            const { accessToken } = await getAuthTokens(user)

            await request(app)
                .post(`/api/v1/subscriptions/${channel._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            const res = await request(app)
                .get("/api/v1/subscriptions")
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeDefined()
            expect(Array.isArray(res.body.data.docs)).toBe(true)
        })
    })
})
