import { z } from "zod";

export const UpdateSettingsSchema = z.object({
  name: z.string().min(1, "Store name is required").optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  taxRate: z.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100").optional(),
  enableCash: z.boolean().optional(),
  enableQris: z.boolean().optional(),
  enableCard: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
