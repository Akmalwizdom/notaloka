import { z } from "zod";
import { CheckoutSchema } from "./transaction.schema";

export const BulkSyncSchema = z.object({
  transactions: z.array(
    z.object({
      id: z.string(), // Local ID from client
      data: CheckoutSchema,
      createdAt: z.string().datetime(),
    })
  ),
});

export type BulkSyncInput = z.infer<typeof BulkSyncSchema>;
