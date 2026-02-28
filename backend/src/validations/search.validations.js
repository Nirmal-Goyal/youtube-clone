import { z } from "zod"
import { paginationQuerySchema } from "./common.schemas.js"

export const searchQuerySchema = paginationQuerySchema.extend({
    q: z.string().trim().min(1, "Search query is required"),
    type: z.enum(["video", "channel", "playlist"], {
        errorMap: () => ({ message: "Valid type is required: video, channel, or playlist" })
    })
})
