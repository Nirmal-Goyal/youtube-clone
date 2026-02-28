import { z } from "zod"

export const objectIdSchema = z
    .string()
    .length(24)
    .regex(/^[a-f0-9]{24}$/i, "Invalid ID")

export const paginationQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10)
})
