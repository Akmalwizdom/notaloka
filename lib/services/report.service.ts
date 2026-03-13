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

  /**
   * OPTIMIZED: Uses aggregate queries instead of loading all transaction rows into memory.
   * Before: findMany({ include: { items: true } }) → O(n) memory
   * After:  aggregate() + aggregate() → O(1) memory, single round-trip each
   */
  private static async fetchPeriodData(
    start: Date,
    end: Date,
  ): Promise<PeriodData> {
    const transactionWhere = {
      createdAt: { gte: start, lte: end },
      status: "PAID" as const,
    };

    const [revenueAgg, itemAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: transactionWhere,
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.transactionItem.aggregate({
        where: {
          transaction: transactionWhere,
        },
        _sum: { quantity: true },
      }),
    ]);

    return {
      revenue: Number(revenueAgg._sum.totalAmount ?? 0),
      transactionCount: revenueAgg._count.id,
      itemCount: Number(itemAgg._sum.quantity ?? 0),
    };
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

  /**
   * OPTIMIZED: Eliminates N+1 query pattern.
   * Before: 1 groupBy + N findUnique (one per product) = N+1 round-trips
   * After:  1 groupBy + 1 findMany (all products at once) = 2 round-trips
   */
  static async getTopProducts(limit: number = 5) {
    const topItems = await prisma.transactionItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    if (topItems.length === 0) return [];

    // Single batch query instead of N individual findUnique calls
    const productIds = topItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    });

    // O(1) lookup map
    const productMap = new Map(products.map((p) => [p.id, p]));

    return topItems.map((item) => ({
      ...productMap.get(item.productId),
      totalSold: item._sum.quantity ?? 0,
    }));
  }

  static async getSummary() {
    const today = new Date();
    const yesterday = subDays(today, 1);

    const todayRange = { start: startOfDay(today), end: endOfDay(today) };
    const yesterdayRange = {
      start: startOfDay(yesterday),
      end: endOfDay(yesterday),
    };

    const [todayData, yesterdayData, recentTransactions] = await Promise.all([
      this.fetchPeriodData(todayRange.start, todayRange.end),
      this.fetchPeriodData(yesterdayRange.start, yesterdayRange.end),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          paymentMethod: true,
          totalAmount: true,
          status: true,
          items: {
            select: {
              productId: true,
              quantity: true,
              priceAtRecord: true,
            },
          },
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
