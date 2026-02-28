import request from "supertest"
import path from "path"
import { fileURLToPath } from "url"
import { getApp } from "./setup.js"
import { createTestUser, getAuthTokens } from "./helpers/testHelpers.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const avatarPath = path.join(__dirname, "fixtures", "avatar.png")

describe("Auth API", () => {
    let app

    beforeAll(async () => {
        app = await getApp()
    })

    describe("POST /api/v1/users/register", () => {
        it("should register user successfully with valid body and avatar", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .field("fullname", "Test User")
                .field("username", "testuser")
                .field("email", "test@example.com")
                .field("password", "password123")
                .attach("avatar", avatarPath)

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toBeDefined()
            expect(res.body.data.username).toBe("testuser")
            expect(res.body.data.email).toBe("test@example.com")
            expect(res.body.data.fullname).toBe("Test User")
            expect(res.body.data.password).toBeUndefined()
        })

        it("should return 400 for validation errors (missing email, short password)", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .field("fullname", "Test")
                .field("username", "test")
                .field("password", "123")
                .attach("avatar", avatarPath)

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe("Validation failed")
            expect(res.body.errors).toBeDefined()
            expect(Array.isArray(res.body.errors)).toBe(true)
        })

        it("should return 409 for duplicate username/email", async () => {
            await request(app)
                .post("/api/v1/users/register")
                .field("fullname", "First User")
                .field("username", "duplicate")
                .field("email", "first@example.com")
                .field("password", "password123")
                .attach("avatar", avatarPath)

            const res = await request(app)
                .post("/api/v1/users/register")
                .field("fullname", "Second User")
                .field("username", "duplicate")
                .field("email", "second@example.com")
                .field("password", "password123")
                .attach("avatar", avatarPath)

            expect(res.status).toBe(409)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toContain("already exists")
        })
    })

    describe("POST /api/v1/users/login", () => {
        it("should login successfully with valid credentials", async () => {
            await createTestUser({ username: "loginuser", email: "login@example.com" })

            const res = await request(app)
                .post("/api/v1/users/login")
                .send({ username: "loginuser", password: "password123" })

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.user).toBeDefined()
            expect(res.body.data.user.username).toBe("loginuser")
            expect(res.body.data.accessToken).toBeDefined()
            expect(res.body.data.refreshToken).toBeDefined()
            expect(res.headers["set-cookie"]).toBeDefined()
        })

        it("should return 401 for wrong password", async () => {
            await createTestUser({ username: "wrongpass", email: "wrong@example.com" })

            const res = await request(app)
                .post("/api/v1/users/login")
                .send({ username: "wrongpass", password: "wrongpassword" })

            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
        })

        it("should return 400 for missing username/email", async () => {
            const res = await request(app)
                .post("/api/v1/users/login")
                .send({ password: "password123" })

            expect(res.status).toBe(400)
            expect(res.body.message).toBe("Validation failed")
        })
    })

    describe("POST /api/v1/users/refresh-token", () => {
        it("should refresh token successfully", async () => {
            const user = await createTestUser({ username: "refresher", email: "refresh@example.com" })
            const { refreshToken } = await getAuthTokens(user)

            const res = await request(app)
                .post("/api/v1/users/refresh-token")
                .send({ refreshToken })

            expect(res.status).toBe(200)
            expect(res.body.data.accessToken).toBeDefined()
            expect(res.body.data.refreshToken).toBeDefined()
        })

        it("should return 401 for invalid refresh token", async () => {
            const res = await request(app)
                .post("/api/v1/users/refresh-token")
                .send({ refreshToken: "invalid-token" })

            expect(res.status).toBe(401)
        })
    })

    describe("POST /api/v1/users/logout", () => {
        it("should logout successfully with valid token", async () => {
            const user = await createTestUser({ username: "logoutuser", email: "logout@example.com" })
            const { accessToken } = await getAuthTokens(user)

            const res = await request(app)
                .post("/api/v1/users/logout")
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
        })
    })

    describe("GET /api/v1/users/current-user", () => {
        it("should return current user when authenticated", async () => {
            const user = await createTestUser({ username: "currentuser", email: "current@example.com" })
            const { accessToken } = await getAuthTokens(user)

            const res = await request(app)
                .get("/api/v1/users/current-user")
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeDefined()
            expect(res.body.data.username).toBe("currentuser")
        })

        it("should return 401 when unauthenticated", async () => {
            const res = await request(app).get("/api/v1/users/current-user")

            expect(res.status).toBe(401)
        })
    })
})
