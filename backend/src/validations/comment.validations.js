import { z } from "zod"
import { objectIdSchema, paginationQuerySchema } from "./common.schemas.js"

export const addCommentSchema = z.object({
    content: z.string().trim().min(1, "Content is required")
})

export const updateCommentSchema = z.object({
    content: z.string().trim().min(1, "Content is required")
})

export const videoIdParamSchema = z.object({
    videoId: objectIdSchema
})

export const commentIdParamSchema = z.object({
    commentId: objectIdSchema
})

export const commentsQuerySchema = paginationQuerySchema
