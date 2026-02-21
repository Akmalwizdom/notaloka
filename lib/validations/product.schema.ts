import { z } from "zod";

export const CreateProductSchema = z.object({
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().nonnegative().default(0),
  categoryId: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
