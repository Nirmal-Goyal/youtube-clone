import request from "supertest"
import { getApp } from "./setup.js"
import {
    createTestUser,
    createTestVideo,
    createTestPlaylist,
    getAuthTokens,
} from "./helpers/testHelpers.js"

describe("Search API", () => {
    let app

    beforeAll(async () => {
        app = await getApp()
    })

    describe("GET /api/v1/search", () => {
        describe("Video search", () => {
            it("should return matching published videos with q and type=video", async () => {
                const user = await createTestUser({ username: "searchuser", email: "search@example.com" })
                await createTestVideo(user._id, {
                    title: "UniqueSearchableVideoTitle",
                    description: "Description",
                    isPublished: true,
                })

                const res = await request(app)
                    .get("/api/v1/search")
                    .query({ q: "UniqueSearchableVideoTitle", type: "video" })

                expect(res.status).toBe(200)
                expect(res.body.success).toBe(true)
                expect(res.body.data).toBeDefined()
                expect(res.body.data.docs).toBeDefined()
                expect(Array.isArray(res.body.data.docs)).toBe(true)
                expect(res.body.data.docs.length).toBeGreaterThanOrEqual(1)
                expect(res.body.data.docs[0].title).toContain("UniqueSearchableVideoTitle")
                expect(res.body.data.totalDocs).toBeDefined()
                expect(res.body.data.page).toBeDefined()
                expect(res.body.data.totalPages).toBeDefined()
                expect(res.body.data.hasNextPage).toBeDefined()
            })

            it("should return empty docs when no video match", async () => {
                const res = await request(app)
                    .get("/api/v1/search")
                    .query({ q: "XyZNoMatch12345", type: "video" })

                expect(res.status).toBe(200)
                expect(res.body.data.docs).toEqual([])
                expect(res.body.data.totalDocs).toBe(0)
            })
        })

        describe("Channel search", () => {
            it("should return matching channels with q and type=channel", async () => {
                await createTestUser({
                    username: "UniqueChannelName",
                    email: "channelsearch@example.com",
                    fullname: "Channel Full Name",
                })

                const res = await request(app)
                    .get("/api/v1/search")
                    .query({ q: "UniqueChannelName", type: "channel" })

                expect(res.status).toBe(200)
                expect(res.body.data.docs).toBeDefined()
                expect(Array.isArray(res.body.data.docs)).toBe(true)
                expect(res.body.data.docs.length).toBeGreaterThanOrEqual(1)
                expect(res.body.data.docs[0].username).toContain("uniquechannelname")
            })

            it("should return empty docs when no channel match", async () => {
                const res = await request(app)
                    .get("/api/v1/search")
                    .query({ q: "XyZNoChannelMatch999", type: "channel" })

                expect(res.status).toBe(200)
                expect(res.body.data.docs).toEqual([])
            })
        })

        describe("Playlist search", () => {
            it("should return matching playlists with q and type=playlist", async () => {
                const user = await createTestUser({ username: "plsearch", email: "plsearch@example.com" })
                await createTestPlaylist(user._id, {
                    name: "UniquePlaylistSearchName",
                    description: "Playlist description",
                })

                const res = await request(app)
                    .get("/api/v1/search")
                    .query({ q: "UniquePlaylistSearchName", type: "playlist" })

                expect(res.status).toBe(200)
                expect(res.body.data.docs).toBeDefined()
                expect(Array.isArray(res.body.data.docs)).toBe(true)
                expect(res.body.data.docs.length).toBeGreaterThanOrEqual(1)
                expect(res.body.data.docs[0].name).toContain("UniquePlaylistSearchName")
            })

            it("should return empty docs when no playlist match", async () => {
                const res = await request(app)
                    .get("/api/v1/search")
                    .query({ q: "XyZNoPlaylistMatch777", type: "playlist" })

                expect(res.status).toBe(200)
                expect(res.body.data.docs).toEqual([])
            })
        })

        describe("Validation", () => {
            it("should return 400 for missing q", async () => {
                const res = await request(app)
                    .get("/api/v1/search")
                    .query({ type: "video" })

                expect(res.status).toBe(400)
                expect(res.body.message).toBe("Validation failed")
            })

            it("should return 400 for missing type", async () => {
                const res = await request(app)
                    .get("/api/v1/search")
                    .query({ q: "test" })

                expect(res.status).toBe(400)
            })

            it("should return 400 for invalid type", async () => {
                const res = await request(app)
                    .get("/api/v1/search")
                    .query({ q: "test", type: "invalid" })

                expect(res.status).toBe(400)
            })
        })

        describe("Pagination", () => {
            it("should respect page and limit parameters", async () => {
                const user = await createTestUser({ username: "paguser", email: "pag@example.com" })
                await createTestVideo(user._id, { title: "PagVideo1", description: "d" })
                await createTestVideo(user._id, { title: "PagVideo2", description: "d" })
                await createTestVideo(user._id, { title: "PagVideo3", description: "d" })

                const res = await request(app)
                    .get("/api/v1/search")
                    .query({ q: "PagVideo", type: "video", page: 1, limit: 2 })

                expect(res.status).toBe(200)
                expect(res.body.data.limit).toBe(2)
                expect(res.body.data.page).toBe(1)
                expect(res.body.data.docs.length).toBeLessThanOrEqual(2)
                expect(res.body.data.totalPages).toBeDefined()
                expect(res.body.data.hasNextPage).toBeDefined()
                expect(res.body.data.hasPrevPage).toBeDefined()
            })
        })
    })
})
