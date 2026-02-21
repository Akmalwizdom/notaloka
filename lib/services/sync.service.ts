import prisma from "@/lib/prisma";
import { BulkSyncInput } from "../validations/sync.schema";

export class SyncService {
  static async processBulkSync(userId: string, data: BulkSyncInput) {
    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    for (const tx of data.transactions) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (prismaTx: any) => {
            // Check if transaction already exists (avoid duplicates)
            const existing = await prismaTx.transaction.findUnique({
                where: { id: tx.id }
            });

            if (existing) {
                results.success.push(tx.id);
                return;
            }

            // Reuse the checkout logic but slightly modified for existing IDs
            // Simplified here: just call the service if it supports custom ID
            // Actually, I'll implement it directly to ensure atomicity and ID handling
            
            // 1. Calculate and update stock
            for (const item of tx.data.items) {
                await prismaTx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // 2. Create transaction
            await prismaTx.transaction.create({
                data: {
                    id: tx.id,
                    totalAmount: tx.data.items.reduce((acc: number, curr) => acc + (curr.quantity * curr.priceAtRecord), 0),
                    paymentMethod: tx.data.paymentMethod,
                    status: tx.data.paymentMethod === "CASH" ? "PAID" : "PENDING",
                    syncStatus: "SYNCED",
                    cashierId: userId,
                    createdAt: new Date(tx.createdAt),
                    items: {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        create: tx.data.items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            priceAtRecord: item.priceAtRecord
                        }))
                    }
                }
            });
        });

        results.success.push(tx.id);
      } catch (error: unknown) {
        const err = error as any;
        console.error(`[Sync Error] Transaction ${tx.id}:`, err);
        results.failed.push({
          id: tx.id,
          error: err.message || "Unknown error during synchronization",
        });

        // Log the failure in DB
        await prisma.syncLog.create({
          data: {
            status: "FAILED",
            details: `Transaction ${tx.id} failed: ${err.message}`,
          },
        });
      }
    }

    // Log general success if any
    if (results.success.length > 0) {
      await prisma.syncLog.create({
        data: {
          status: "SUCCESS",
          details: `Successfully synced ${results.success.length} transactions.`,
        },
      });
    }

    return results;
  }
}
