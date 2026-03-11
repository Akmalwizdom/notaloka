import prisma from "@/lib/prisma";
import { CheckoutInput } from "../validations/transaction.schema";
import { AppError } from "../api-utils";
import { Prisma, TransactionStatus, PaymentMethod } from "@prisma/client";

interface TransactionFilters {
  query?: string;
  status?: string;
  paymentMethod?: string;
  from?: string;
  to?: string;
}

export class TransactionService {
  static async checkout(userId: string, data: CheckoutInput) {
    return await prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      // 1. Calculate total and check stock for each item
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new AppError(
            `Product with ID ${item.productId} not found`,
            404,
            "NOT_FOUND",
          );
        }

        if (product.stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product: ${product.name}`,
            400,
            "INSUFFICIENT_STOCK",
          );
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

  static async getHistory(userId?: string, filters?: TransactionFilters) {
    let where: Prisma.TransactionWhereInput = userId
      ? { cashierId: userId }
      : {};

    if (filters) {
      if (filters.status) {
        where = { ...where, status: filters.status as TransactionStatus };
      }

      if (filters.paymentMethod) {
        where = {
          ...where,
          paymentMethod: filters.paymentMethod as PaymentMethod,
        };
      }

      if (filters.from || filters.to) {
        where = {
          ...where,
          createdAt: {
            ...(filters.from && { gte: new Date(filters.from) }),
            ...(filters.to && { lte: new Date(filters.to) }),
          },
        };
      }
    }

    return await prisma.transaction.findMany({
      where,
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

  static async updateStatus(
    id: string,
    status: TransactionStatus,
    midtransId?: string,
  ) {
    return await prisma.transaction.update({
      where: { id },
      data: {
        status,
        ...(midtransId && { midtransId }),
      },
    });
  }
}
