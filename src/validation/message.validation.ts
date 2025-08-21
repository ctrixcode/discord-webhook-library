import { z } from 'zod';
import { EmbedSchema } from './embed.validation';

export const MessageSchema = z
  .object({
    content: z.string().max(2000).optional(),
    username: z.string().optional(),
    avatar_url: z.string().url().optional(),
    tts: z.boolean().optional(),
    embeds: z.array(EmbedSchema).max(10).optional(),
    thread_name: z.string().optional(),
    flags: z.number().int().optional(),
  })
  .refine(
    (data) => {
      const hasContent = !!data.content?.trim();
      const hasEmbeds = !!data.embeds?.length;

      if (hasEmbeds && data.embeds) {
        return (
          hasContent ||
          data.embeds.some(
            (embed) =>
              embed.title ||
              embed.description ||
              embed.fields?.length ||
              embed.author ||
              embed.footer ||
              embed.image ||
              embed.thumbnail
          )
        );
      }

      return hasContent;
    },
    {
      message: 'Message must have content or at least one non-empty embed.',
    }
  );
