import prisma from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
} from "date-fns";

interface PeriodData {
  revenue: number;
  transactionCount: number;
  itemCount: number;
}

export interface SalesReport {
  revenue: number;
  transactionCount: number;
  itemCount: number;
  revenueChange: number;
  transactionCountChange: number;
  itemCountChange: number;
  period: {
    start: Date;
    end: Date;
  };
}

export class ReportService {
  private static calcChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
  }

  private static async fetchPeriodData(
    start: Date,
    end: Date,
  ): Promise<PeriodData> {
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

    const revenue = transactions.reduce(
      (acc, curr) => acc + Number(curr.totalAmount),
      0,
    );

    const transactionCount = transactions.length;

    const itemCount = transactions.reduce(
      (acc, curr) =>
        acc + curr.items.reduce((sum, item) => sum + item.quantity, 0),
      0,
    );

    return { revenue, transactionCount, itemCount };
  }

  static async getSalesReport(
    start: Date,
    end: Date,
    prevStart: Date,
    prevEnd: Date,
  ): Promise<SalesReport> {
    const [current, previous] = await Promise.all([
      this.fetchPeriodData(start, end),
      this.fetchPeriodData(prevStart, prevEnd),
    ]);

    return {
      revenue: current.revenue,
      transactionCount: current.transactionCount,
      itemCount: current.itemCount,
      revenueChange: this.calcChange(current.revenue, previous.revenue),
      transactionCountChange: this.calcChange(
        current.transactionCount,
        previous.transactionCount,
      ),
      itemCountChange: this.calcChange(current.itemCount, previous.itemCount),
      period: { start, end },
    };
  }

  static async getDailyReport(): Promise<SalesReport> {
    const today = new Date();
    const yesterday = subDays(today, 1);

    return this.getSalesReport(
      startOfDay(today),
      endOfDay(today),
      startOfDay(yesterday),
      endOfDay(yesterday),
    );
  }

  static async getMonthlyReport(): Promise<SalesReport> {
    const today = new Date();
    const lastMonth = subMonths(today, 1);

    return this.getSalesReport(
      startOfMonth(today),
      endOfMonth(today),
      startOfMonth(lastMonth),
      endOfMonth(lastMonth),
    );
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
      topItems.map(
        async (item: {
          productId: string;
          _sum: { quantity: number | null };
        }) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, sku: true },
          });
          return {
            ...product,
            totalSold: item._sum.quantity ?? 0,
          };
        },
      ),
    );

    return productsWithDetails;
  }

  static async getSummary() {
    const today = new Date();
    const yesterday = subDays(today, 1);

    const [todayData, yesterdayData, recentTransactions] = await Promise.all([
      this.fetchPeriodData(startOfDay(today), endOfDay(today)),
      this.fetchPeriodData(startOfDay(yesterday), endOfDay(yesterday)),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      }),
    ]);

    const avgOrderValue =
      todayData.transactionCount > 0
        ? todayData.revenue / todayData.transactionCount
        : 0;

    return {
      totalRevenue: todayData.revenue,
      revenueChange: this.calcChange(todayData.revenue, yesterdayData.revenue),
      totalOrders: todayData.transactionCount,
      ordersChange: this.calcChange(
        todayData.transactionCount,
        yesterdayData.transactionCount,
      ),
      avgOrderValue,
      recentTransactions: recentTransactions.map((trx) => ({
        id: trx.id,
        paymentMethod: trx.paymentMethod,
        totalAmount: Number(trx.totalAmount),
        paymentStatus: trx.status.toLowerCase(),
        items: trx.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.priceAtRecord),
        })),
      })),
    };
  }
}
