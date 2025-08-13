import { z } from 'zod';
import { EmbedSchema } from './embed.validation';

export const MessageSchema = z.object({
  content: z.string().max(2000).optional(),
  username: z.string().optional(),
  avatar_url: z.string().url().optional(),
  tts: z.boolean().optional(),
  embeds: z.array(EmbedSchema).max(10).optional(),
  thread_name: z.string().optional(),
  flags: z.number().int().optional(),
});
