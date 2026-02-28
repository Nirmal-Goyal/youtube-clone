import { z } from "zod"
import { objectIdSchema, paginationQuerySchema } from "./common.schemas.js"

export const channelIdParamSchema = z.object({
    channelId: objectIdSchema
})

export const subscriptionsQuerySchema = paginationQuerySchema
