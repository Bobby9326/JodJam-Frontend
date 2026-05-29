import { z } from 'zod'

export const createEntrySchema = z.object({
  note: z.string().min(1, 'กรุณาเขียนบันทึก'),
  mood: z.enum(['happy', 'sad', 'tired', 'stressed', 'excited', 'angry', 'bored', 'lonely']),
  rating: z.number().min(1).max(5),
})

export type CreateEntryFormData = z.infer<typeof createEntrySchema>
