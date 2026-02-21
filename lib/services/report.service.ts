import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export class ReportService {
  static async getSalesReport(start: Date, end: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "PAID",
      },
      include: {
        items: true,
      },
    });

    const totalRevenue = transactions.reduce((acc: number, curr) => acc + Number(curr.totalAmount), 0);
    const totalTransactions = transactions.length;
    const totalItemsSold = transactions.reduce(
      (acc: number, curr) => acc + curr.items.reduce((sum: number, item) => sum + item.quantity, 0),
      0
    );

    return {
      revenue: totalRevenue,
      transactionCount: totalTransactions,
      itemCount: totalItemsSold,
      period: { start, end },
    };
  }

  static async getDailyReport() {
    const today = new Date();
    return this.getSalesReport(startOfDay(today), endOfDay(today));
  }

  static async getMonthlyReport() {
    const today = new Date();
    return this.getSalesReport(startOfMonth(today), endOfMonth(today));
  }

  static async getTopProducts(limit: number = 5) {
    const topItems = await prisma.transactionItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limit,
    });

    const productsWithDetails = await Promise.all(
      topItems.map(async (item: { productId: string; _sum: { quantity: number | null } }) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, sku: true },
        });
        return {
          ...product,
          totalSold: item._sum.quantity,
        };
      })
    );

    return productsWithDetails;
  }
}
