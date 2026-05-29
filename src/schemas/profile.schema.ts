import { z } from 'zod'

export const profileSchema = z.object({
  username: z.string().min(3, 'ต้องมีอย่างน้อย 3 ตัวอักษร').max(30),
  bio: z.string().max(160).optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
