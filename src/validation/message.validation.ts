import { z } from 'zod';
import { EmbedSchema } from './embed.validation';

/**
 * Zod schema for validating Discord webhook message payloads.
 *
 * Enforces Discord constraints and requires either non-empty `content`,
 * at least one non-empty embed, or file attachments.
 */
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

/**
 * Extended validation function for messages with attachments.
 * This validates the JSON payload and also checks if attachments are present.
 */
export function validateMessageWithAttachments(
  payload: Record<string, unknown>,
  hasAttachments: boolean
): { success: boolean; error?: string } {
  // First validate the basic payload structure
  const result = MessageSchema.safeParse(payload);
  
  if (!result.success) {
    // If basic validation fails, check if it's because of missing content/embeds
    // but we have attachments which should make it valid
    if (hasAttachments) {
      const hasContent = !!(payload.content as string)?.trim();
      const hasEmbeds = !!(payload.embeds as unknown[])?.length;
      
      if (!hasContent && !hasEmbeds) {
        // Attachments alone are valid for Discord
        return { success: true };
      }
    }
    
    return {
      success: false,
      error: result.error.issues.map(issue => issue.message).join(', ')
    };
  }
  
  return { success: true };
}
