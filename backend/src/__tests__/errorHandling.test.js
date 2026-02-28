import request from "supertest"
import { getApp } from "./setup.js"

describe("Error Handling", () => {
    let app

    beforeAll(async () => {
        app = await getApp()
    })

    it("should return 404 for non-existent route", async () => {
        const res = await request(app).get("/api/v1/nonexistent")

        expect(res.status).toBe(404)
        expect(res.body.success).toBe(false)
    })

    it("should return 401 for invalid JWT", async () => {
        const res = await request(app)
            .get("/api/v1/users/current-user")
            .set("Authorization", "Bearer invalid-token")

        expect(res.status).toBe(401)
    })
})
