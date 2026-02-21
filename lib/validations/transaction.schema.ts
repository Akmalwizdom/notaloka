import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const TransactionItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  priceAtRecord: z.number().positive(),
});

export const CheckoutSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  items: z.array(TransactionItemSchema).min(1, "At least one item is required"),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
