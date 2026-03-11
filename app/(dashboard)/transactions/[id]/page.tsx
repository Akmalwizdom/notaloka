"use client";

import { useParams, useRouter } from "next/navigation";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { mapToFrontendDisplay } from "@/lib/payment-methods";
import {
  ArrowLeft,
  ReceiptText,
  Calendar,
  Clock,
  User,
  Package,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtRecord: number;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
  };
}

interface Transaction {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  cashierId: string;
  createdAt: string;
  updatedAt: string;
  items: TransactionItem[];
  cashier: {
    name: string;
    email: string;
  };
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: async () => {
      const transactions = await apiClient.get<Transaction[]>(`/api/v1/transactions`);
      return transactions.find((t) => t.id === transactionId);
    },
    enabled: !!transactionId,
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <AlertCircle className="size-12 text-rose-500" />
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Transaction Not Found
          </h2>
          <p className="text-sm text-slate-500">
            The transaction you're looking for doesn't exist.
          </p>
        </div>
        <Button onClick={() => router.push("/transactions")}>
          <ArrowLeft className="size-4" />
          Back to Transactions
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "expired":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const { date, time } = formatDate(transaction.createdAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/transactions")}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Transaction Details
          </h1>
          <p className="text-sm text-slate-500">
            {transaction.id}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Transaction Info Card */}
        <BentoCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
              <ReceiptText className="size-5" />
            </div>
            <h2 className="font-bold text-lg">Transaction Info</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                  getStatusStyle(transaction.status)
                )}
              >
                {transaction.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Date</span>
              <span className="font-medium flex items-center gap-2">
                <Calendar className="size-4" />
                {date}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Time</span>
              <span className="font-medium flex items-center gap-2">
                <Clock className="size-4" />
                {time}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-medium flex items-center gap-2">
                <CreditCard className="size-4" />
                {mapToFrontendDisplay(transaction.paymentMethod)}
              </span>
            </div>
          </div>
        </BentoCard>

        {/* Cashier Info Card */}
        <BentoCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <User className="size-5" />
            </div>
            <h2 className="font-bold text-lg">Cashier</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Name</span>
              <span className="font-medium">{transaction.cashier.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-600 dark:text-slate-400">
                {transaction.cashier.email}
              </span>
            </div>
          </div>
        </BentoCard>

        {/* Total Card */}
        <BentoCard className="p-6 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CreditCard className="size-5" />
            </div>
            <h2 className="font-bold text-lg">Total Amount</h2>
          </div>
          <div className="text-3xl font-black text-brand">
            Rp {Number(transaction.totalAmount).toLocaleString()}
          </div>
        </BentoCard>
      </div>

      {/* Items Table */}
      <BentoCard className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
              <Package className="size-4" />
            </div>
            <h2 className="font-bold text-lg">Order Items</h2>
            <span className="text-xs text-slate-500 ml-auto">
              {transaction.items.length} item(s)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/2 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4 text-center">Quantity</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {transaction.items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.product.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 font-mono">
                      {item.product.sku}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Rp {Number(item.priceAtRecord).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      Rp {(item.quantity * item.priceAtRecord).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BentoCard>
    </div>
  );
}
