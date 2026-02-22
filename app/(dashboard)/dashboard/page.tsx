"use client";

import Link from "next/link";
import { BentoCard } from "@/components/ui/bento-card";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Loader2, AlertCircle } from "lucide-react";

// Mock data removed

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const {
    data: summary,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["report-summary"],
    queryFn: () =>
      apiClient.get<{
        totalRevenue: number;
        revenueChange: number;
        totalOrders: number;
        ordersChange: number;
        avgOrderValue: number;
        recentTransactions: {
          id: string;
          paymentMethod: string;
          totalAmount: number;
          paymentStatus: string;
          items: {
            productId: string;
            quantity: number;
            price: number;
          }[];
        }[];
      }>("/api/v1/reports"),
  });

  if (isLoading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex h-100 flex-col items-center justify-center gap-2">
        <AlertCircle className="size-8 text-rose-500" />
        <p className="text-slate-500">Failed to load dashboard data</p>
      </div>
    );
  }

  // At this point summary is guaranteed to be defined
  const data = summary;

  const stats = [
    {
      label: "Total Revenue",
      value: `Rp ${new Intl.NumberFormat("id-ID").format(data.totalRevenue ?? 0)}`,
      change: `${data.revenueChange > 0 ? "+" : ""}${(data.revenueChange ?? 0).toFixed(1)}%`,
      icon: DollarSign,
      trend: (data.revenueChange ?? 0) >= 0 ? "up" : "down",
    },
    {
      label: "Total Orders",
      value: (data.totalOrders ?? 0).toString(),
      change: `${data.ordersChange > 0 ? "+" : ""}${(data.ordersChange ?? 0).toFixed(1)}%`,
      icon: ShoppingBag,
      trend: (data.ordersChange ?? 0) >= 0 ? "up" : "down",
    },
    {
      label: "Sync Status",
      value: "Healthy",
      change: "Live",
      icon: Clock,
      trend: "up",
    },
    {
      label: "Avg. Order Value",
      value: `Rp ${new Intl.NumberFormat("id-ID").format(data.avgOrderValue ?? 0)}`,
      change: "0.0%",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => (
          <motion.div key={idx} variants={item}>
            <BentoCard className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-brand/10 text-brand">
                  <stat.icon className="size-5" />
                </div>
                <div
                  className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    stat.trend === "up"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-rose-500/10 text-rose-500",
                  )}
                >
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {stat.value}
                </h3>
              </div>
            </BentoCard>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <BentoCard className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent Transactions
              </h3>
              <p className="text-sm text-slate-500">
                Live feed of store activities
              </p>
            </div>
            <button className="text-sm text-brand font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {(data.recentTransactions ?? []).map((trx) => (
              <div
                key={trx.id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <Clock className="size-5 text-slate-400 group-hover:text-brand transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {trx.paymentMethod.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {trx.id} • {trx.items?.length || 0} items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    Rp {new Intl.NumberFormat("id-ID").format(trx.totalAmount)}
                  </p>
                  <p
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      trx.paymentStatus === "settlement" ||
                        trx.paymentStatus === "completed"
                        ? "text-emerald-500"
                        : trx.paymentStatus === "pending"
                          ? "text-amber-500"
                          : "text-rose-500",
                    )}
                  >
                    {trx.paymentStatus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
          <BentoCard variant="graphite" className="text-white overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp className="size-32" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2 italic">Pro Tip</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                You noticed a 15% increase in sales during lunch hours. Consider
                running a &quot;Lunch Special&quot; promo to boost it further.
              </p>
              <button className="mt-6 px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                Setup Promo
              </button>
            </div>
          </BentoCard>

          <BentoCard className="flex flex-col items-center text-center py-10">
            <div className="size-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand mb-4">
              <ShoppingBag className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Start New Sale
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Process a quick checkout for your customer.
            </p>
            <Link
              href="/checkout"
              className="w-full py-3 bg-brand text-white rounded-xl font-bold shadow-lg shadow-brand/20 hover:scale-[1.02] transition-transform active:scale-[0.98]"
            >
              Open POS View
            </Link>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
