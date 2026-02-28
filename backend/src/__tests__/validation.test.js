import request from "supertest"
import { getApp } from "./setup.js"

describe("Validation (Zod)", () => {
    let app

    beforeAll(async () => {
        app = await getApp()
    })

    it("should return 400 for login with missing password", async () => {
        const res = await request(app)
            .post("/api/v1/users/login")
            .send({ email: "x@y.com" })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe("Validation failed")
        expect(res.body.errors).toBeDefined()
        expect(res.body.errors.some((e) => e.field === "password" || e.path?.includes("password"))).toBe(true)
    })

    it("should return 400 for login with invalid email format", async () => {
        const res = await request(app)
            .post("/api/v1/users/login")
            .send({ email: "invalid", password: "x" })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe("Validation failed")
    })

    it("should return 400 for invalid video ID", async () => {
        const res = await request(app).get("/api/v1/videos/not-an-id")

        expect(res.status).toBe(400)
    })

    it("should return 400 for search with missing q", async () => {
        const res = await request(app).get("/api/v1/search?type=video")

        expect(res.status).toBe(400)
        expect(res.body.message).toBe("Validation failed")
    })
})
