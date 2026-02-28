import { z } from "zod"
import { objectIdSchema, paginationQuerySchema } from "./common.schemas.js"

export const publishVideoSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1, "Description is required"),
    duration: z.coerce.number().positive("Valid duration is required")
})

export const updateVideoSchema = z.object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    isPublished: z.boolean().optional()
})

export const videoIdParamSchema = z.object({
    videoId: objectIdSchema
})

const sortByEnum = ["createdAt", "views", "duration", "title"]
const sortTypeEnum = ["asc", "desc"]

export const getAllVideosQuerySchema = paginationQuerySchema.extend({
    sortBy: z.enum(sortByEnum).default("createdAt"),
    sortType: z.enum(sortTypeEnum).default("desc")
})
