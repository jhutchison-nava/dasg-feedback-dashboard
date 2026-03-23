import * as z from "zod";

export const formsSchema = z.object({
  data: z.object({
    id: z.string(),
    attributes: z.object({
      short_uuid: z.string()
    })
  }).array()
})