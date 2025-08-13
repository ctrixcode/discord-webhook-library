import { z } from 'zod';

export const EmbedSchema = z.object({
  title: z.string().max(256).optional(),
  description: z.string().max(4096).optional(),
  url: z.url().optional(),
  color: z.number().int().min(0).max(16777215).optional(),
  timestamp: z.string().datetime().optional(),
  author: z
    .object({
      name: z.string().max(256),
      url: z.url().optional(),
      icon_url: z.string().url().optional(),
    })
    .optional(),
  footer: z
    .object({
      text: z.string().max(2048),
      icon_url: z.string().url().optional(),
    })
    .optional(),
  image: z
    .object({
      url: z.string().url(),
    })
    .optional(),
  thumbnail: z
    .object({
      url: z.string().url(),
    })
    .optional(),
  fields: z
    .array(
      z.object({
        name: z.string().max(256),
        value: z.string().max(1024),
        inline: z.boolean().optional(),
      })
    )
    .max(25)
    .optional(),
});
