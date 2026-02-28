import { z } from "zod"
import { objectIdSchema } from "./common.schemas.js"

export const videoIdParamSchema = z.object({
    videoId: objectIdSchema
})

export const commentIdParamSchema = z.object({
    commentId: objectIdSchema
})
