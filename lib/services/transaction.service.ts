import prisma from "@/lib/prisma";
import { CheckoutInput } from "../validations/transaction.schema";
import { AppError } from "../api-utils";
import { TransactionStatus } from "@prisma/client";

export class TransactionService {
  static async checkout(userId: string, data: CheckoutInput) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await prisma.$transaction(async (tx: any) => {
      let totalAmount = 0;

      // 1. Calculate total and check stock for each item
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new AppError(`Product with ID ${item.productId} not found`, 404, "NOT_FOUND");
        }

        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for product: ${product.name}`, 400, "INSUFFICIENT_STOCK");
        }

        totalAmount += item.quantity * item.priceAtRecord;

        // 2. Decrement product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          totalAmount,
          paymentMethod: data.paymentMethod,
          status: data.paymentMethod === "CASH" ? "PAID" : "PENDING",
          cashierId: userId,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtRecord: item.priceAtRecord,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return transaction;
    });
  }

  static async getHistory(userId?: string) {
    return await prisma.transaction.findMany({
      where: userId ? { cashierId: userId } : {},
      include: {
        items: {
          include: {
            product: true,
          },
        },
        cashier: {
          select: { name: true, email: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async updateStatus(id: string, status: TransactionStatus, midtransId?: string) {
    return await prisma.transaction.update({
      where: { id },
      data: { 
        status,
        ...(midtransId && { midtransId }),
      },
    });
  }
}
