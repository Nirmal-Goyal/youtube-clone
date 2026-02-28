import { z } from "zod"
import { objectIdSchema, paginationQuerySchema } from "./common.schemas.js"

export const createPlaylistSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().min(1, "Description is required")
})

export const updatePlaylistSchema = z.object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional()
})

export const playlistIdParamSchema = z.object({
    playlistId: objectIdSchema
})

export const playlistVideoParamsSchema = z.object({
    playlistId: objectIdSchema,
    videoId: objectIdSchema
})

export const playlistsQuerySchema = paginationQuerySchema
