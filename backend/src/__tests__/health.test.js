import request from "supertest"
import { getApp } from "./setup.js"

describe("Health API", () => {
    let app

    beforeAll(async () => {
        app = await getApp()
    })

    describe("GET /api/v1/health", () => {
        it("should return 200 with ok or degraded status when DB is connected", async () => {
            const res = await request(app).get("/api/v1/health")

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(["ok", "degraded"]).toContain(res.body.status)
            expect(res.body.services.database).toBe("ok")
            expect(res.body.timestamp).toBeDefined()
            expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp)
        })

        it("should include services object with database and cloudinary", async () => {
            const res = await request(app).get("/api/v1/health")

            expect(res.body.services).toBeDefined()
            expect(res.body.services.database).toBeDefined()
            expect(res.body.services.cloudinary).toBeDefined()
            expect(["ok", "unconfigured"]).toContain(res.body.services.cloudinary)
        })
    })
})
