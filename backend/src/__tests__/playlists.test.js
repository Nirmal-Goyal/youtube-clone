import request from "supertest"
import mongoose from "mongoose"
import { getApp } from "./setup.js"
import {
    createTestUser,
    createTestVideo,
    createTestPlaylist,
    getAuthTokens,
} from "./helpers/testHelpers.js"

describe("Playlists API", () => {
    let app

    beforeAll(async () => {
        app = await getApp()
    })

    describe("POST /api/v1/playlists", () => {
        it("should create playlist with valid body", async () => {
            const user = await createTestUser({ username: "plcreate", email: "plcreate@example.com" })
            const { accessToken } = await getAuthTokens(user)

            const res = await request(app)
                .post("/api/v1/playlists")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ name: "My Playlist", description: "My playlist description" })

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toBeDefined()
            expect(res.body.data.name).toBe("My Playlist")
            expect(res.body.data.description).toBe("My playlist description")
        })

        it("should return 400 for missing name/description", async () => {
            const user = await createTestUser({ username: "plinvalid", email: "plinvalid@example.com" })
            const { accessToken } = await getAuthTokens(user)

            const res = await request(app)
                .post("/api/v1/playlists")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ name: "", description: "" })

            expect(res.status).toBe(400)
        })

        it("should return 401 without auth", async () => {
            const res = await request(app)
                .post("/api/v1/playlists")
                .send({ name: "My Playlist", description: "Description" })

            expect(res.status).toBe(401)
        })
    })

    describe("GET /api/v1/playlists", () => {
        it("should get user playlists with auth", async () => {
            const user = await createTestUser({ username: "plget", email: "plget@example.com" })
            const { accessToken } = await getAuthTokens(user)
            await createTestPlaylist(user._id, { name: "Playlist 1" })

            const res = await request(app)
                .get("/api/v1/playlists")
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeDefined()
            expect(res.body.data.docs).toBeDefined()
            expect(Array.isArray(res.body.data.docs)).toBe(true)
            expect(res.body.data.totalDocs).toBeDefined()
            expect(res.body.data.page).toBeDefined()
            expect(res.body.data.totalPages).toBeDefined()
        })

        it("should return 401 without auth", async () => {
            const res = await request(app).get("/api/v1/playlists")
            expect(res.status).toBe(401)
        })
    })

    describe("GET /api/v1/playlists/:playlistId", () => {
        it("should get playlist by valid ID", async () => {
            const user = await createTestUser({ username: "plgetbyid", email: "plgetbyid@example.com" })
            const playlist = await createTestPlaylist(user._id)

            const res = await request(app).get(`/api/v1/playlists/${playlist._id}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeDefined()
            expect(res.body.data._id).toBe(playlist._id.toString())
        })

        it("should return 400 for invalid ObjectId", async () => {
            const res = await request(app).get("/api/v1/playlists/invalid-id")
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent playlist", async () => {
            const fakeId = new mongoose.Types.ObjectId()
            const res = await request(app).get(`/api/v1/playlists/${fakeId}`)
            expect(res.status).toBe(404)
        })
    })

    describe("PATCH /api/v1/playlists/:playlistId", () => {
        it("should update playlist when owner", async () => {
            const user = await createTestUser({ username: "plupdate", email: "plupdate@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const playlist = await createTestPlaylist(user._id)

            const res = await request(app)
                .patch(`/api/v1/playlists/${playlist._id}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ name: "Updated Name", description: "Updated description" })

            expect(res.status).toBe(200)
            expect(res.body.data.name).toBe("Updated Name")
            expect(res.body.data.description).toBe("Updated description")
        })

        it("should return 403 when not owner", async () => {
            const owner = await createTestUser({ username: "plowner", email: "plowner@example.com" })
            const other = await createTestUser({ username: "plother", email: "plother@example.com" })
            const { accessToken } = await getAuthTokens(other)
            const playlist = await createTestPlaylist(owner._id)

            const res = await request(app)
                .patch(`/api/v1/playlists/${playlist._id}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ name: "Hacked" })

            expect(res.status).toBe(403)
        })

        it("should return 404 for non-existent playlist", async () => {
            const user = await createTestUser({ username: "pl404", email: "pl404@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const fakeId = new mongoose.Types.ObjectId()

            const res = await request(app)
                .patch(`/api/v1/playlists/${fakeId}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ name: "Updated" })

            expect(res.status).toBe(404)
        })
    })

    describe("DELETE /api/v1/playlists/:playlistId", () => {
        it("should delete playlist when owner", async () => {
            const user = await createTestUser({ username: "pldel", email: "pldel@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const playlist = await createTestPlaylist(user._id)

            const res = await request(app)
                .delete(`/api/v1/playlists/${playlist._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
        })

        it("should return 403 when not owner", async () => {
            const owner = await createTestUser({ username: "pldelowner", email: "pldelowner@example.com" })
            const other = await createTestUser({ username: "pldelother", email: "pldelother@example.com" })
            const { accessToken } = await getAuthTokens(other)
            const playlist = await createTestPlaylist(owner._id)

            const res = await request(app)
                .delete(`/api/v1/playlists/${playlist._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(403)
        })

        it("should return 404 for non-existent playlist", async () => {
            const user = await createTestUser({ username: "pldel404", email: "pldel404@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const fakeId = new mongoose.Types.ObjectId()

            const res = await request(app)
                .delete(`/api/v1/playlists/${fakeId}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(404)
        })
    })

    describe("POST /api/v1/playlists/:playlistId/videos/:videoId", () => {
        it("should add video to playlist when owner", async () => {
            const user = await createTestUser({ username: "pladd", email: "pladd@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const playlist = await createTestPlaylist(user._id)
            const video = await createTestVideo(user._id)

            const res = await request(app)
                .post(`/api/v1/playlists/${playlist._id}/videos/${video._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data.videos).toBeDefined()
            const videoIds = res.body.data.videos.map((v) => (typeof v === "object" && v._id ? v._id : v).toString())
            expect(videoIds).toContain(video._id.toString())
        })

        it("should return 403 when not owner", async () => {
            const owner = await createTestUser({ username: "pladdowner", email: "pladdowner@example.com" })
            const other = await createTestUser({ username: "pladdother", email: "pladdother@example.com" })
            const { accessToken } = await getAuthTokens(other)
            const playlist = await createTestPlaylist(owner._id)
            const video = await createTestVideo(owner._id)

            const res = await request(app)
                .post(`/api/v1/playlists/${playlist._id}/videos/${video._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(403)
        })

        it("should return 404 for non-existent playlist", async () => {
            const user = await createTestUser({ username: "pladd404pl", email: "pladd404pl@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const video = await createTestVideo(user._id)
            const fakeId = new mongoose.Types.ObjectId()

            const res = await request(app)
                .post(`/api/v1/playlists/${fakeId}/videos/${video._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(404)
        })

        it("should return 404 for non-existent video", async () => {
            const user = await createTestUser({ username: "pladd404vid", email: "pladd404vid@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const playlist = await createTestPlaylist(user._id)
            const fakeId = new mongoose.Types.ObjectId()

            const res = await request(app)
                .post(`/api/v1/playlists/${playlist._id}/videos/${fakeId}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(404)
        })
    })

    describe("DELETE /api/v1/playlists/:playlistId/videos/:videoId", () => {
        it("should remove video from playlist when owner", async () => {
            const user = await createTestUser({ username: "plremove", email: "plremove@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const video = await createTestVideo(user._id)
            const playlist = await createTestPlaylist(user._id, { videos: [video._id] })

            const res = await request(app)
                .delete(`/api/v1/playlists/${playlist._id}/videos/${video._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(200)
        })

        it("should return 403 when not owner", async () => {
            const owner = await createTestUser({ username: "plremowner", email: "plremowner@example.com" })
            const other = await createTestUser({ username: "plremother", email: "plremother@example.com" })
            const { accessToken } = await getAuthTokens(other)
            const video = await createTestVideo(owner._id)
            const playlist = await createTestPlaylist(owner._id, { videos: [video._id] })

            const res = await request(app)
                .delete(`/api/v1/playlists/${playlist._id}/videos/${video._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(403)
        })

        it("should return 404 for non-existent playlist", async () => {
            const user = await createTestUser({ username: "plrem404", email: "plrem404@example.com" })
            const { accessToken } = await getAuthTokens(user)
            const video = await createTestVideo(user._id)
            const fakeId = new mongoose.Types.ObjectId()

            const res = await request(app)
                .delete(`/api/v1/playlists/${fakeId}/videos/${video._id}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(res.status).toBe(404)
        })
    })
})
