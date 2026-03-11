"use client";

import { useRouter } from "next/navigation";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ReceiptText,
  Search,
  Download,
  Calendar,
  Loader2,
  AlertCircle,
  Eye,
  X,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { mapToFrontendDisplay } from "@/lib/payment-methods";
import { useState } from "react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  cashierId: string;
  createdAt: string;
  updatedAt: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ["transactions", searchQuery, statusFilter, paymentFilter, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (paymentFilter !== "all") params.set("paymentMethod", paymentFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const query = params.toString() ? `/api/v1/transactions?${params.toString()}` : "/api/v1/transactions";
      return apiClient.get<Transaction[]>(query);
    },
  });

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = ["Transaction ID", "Date", "Time", "Payment Method", "Amount", "Status"];
    const csvData = transactions.map((trx) => {
      const { date, time } = formatDate(trx.createdAt);
      return [
        trx.id,
        date,
        time,
        mapToFrontendDisplay(trx.paymentMethod),
        Number(trx.totalAmount).toLocaleString(),
        trx.status,
      ].join(",");
    });

    const csv = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Transactions exported successfully");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || paymentFilter !== "all" || dateFrom || dateTo;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Transaction History
          </h1>
          <p className="text-sm text-slate-500">
            Review and manage your store sales records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="size-4" />
            Filter {hasActiveFilters && <span className="ml-1 size-2 rounded-full bg-brand" />}
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {showFilters && (
        <BentoCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="size-4" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-xs">Date From</Label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Date To</Label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <option value="all">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Payment Method</Label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <option value="all">All Methods</option>
                <option value="CASH">Cash</option>
                <option value="QRIS_STATIC">QRIS</option>
                <option value="VA">Card/VA</option>
              </select>
            </div>
          </div>
        </BentoCard>
      )}

      <BentoCard className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-white dark:bg-background-dark border border-slate-200 dark:border-white/10 text-sm outline-none focus:border-brand transition-all"
              placeholder="Search by ID or customer..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Showing {transactions?.length || 0} transactions
          </p>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="size-8 animate-spin text-brand" />
            </div>
          ) : transactions?.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
              <AlertCircle className="size-12 mb-4" />
              <p className="text-sm font-medium">No transactions found</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/2 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {transactions?.map((trx) => {
                  const { date, time } = formatDate(trx.createdAt);
                  return (
                    <tr
                      key={trx.id}
                      onClick={() => router.push(`/transactions/${trx.id}`)}
                      className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                            <ReceiptText className="size-5" />
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                            {trx.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <p className="font-medium">{date}</p>
                          <p className="text-[10px] uppercase opacity-70 italic">
                            {time}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 font-bold uppercase text-slate-500 dark:text-slate-400">
                          {mapToFrontendDisplay(trx.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          Rp {Number(trx.totalAmount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            getStatusStyle(trx.status),
                          )}
                        >
                          {trx.status}
                        </div>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => router.push(`/transactions/${trx.id}`)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-brand transition-all"
                          title="View Details"
                        >
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </BentoCard>
    </div>
  );
}
