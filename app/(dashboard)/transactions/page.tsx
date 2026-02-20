"use client";

import { BentoCard } from "@/components/ui/bento-card";
import {
  ReceiptText,
  Search,
  Download,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const transactions = [
  {
    id: "TRX-8821",
    date: "2024-02-20",
    time: "09:42",
    customer: "Dian Saputra",
    total: "Rp 450.000",
    method: "QRIS",
    status: "Completed",
  },
  {
    id: "TRX-8820",
    date: "2024-02-20",
    time: "09:15",
    customer: "Ani Wijaya",
    total: "Rp 120.000",
    method: "Cash",
    status: "Completed",
  },
  {
    id: "TRX-8819",
    date: "2024-02-19",
    time: "18:30",
    customer: "Budi Setiawan",
    total: "Rp 75.000",
    method: "Card",
    status: "Completed",
  },
  {
    id: "TRX-8818",
    date: "2024-02-19",
    time: "16:45",
    customer: "Siska Putri",
    total: "Rp 320.000",
    method: "Cash",
    status: "Cancelled",
  },
  {
    id: "TRX-8817",
    date: "2024-02-19",
    time: "14:20",
    customer: "Ahmad Dani",
    total: "Rp 1.250.000",
    method: "Card",
    status: "Completed",
  },
];

export default function TransactionsPage() {
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
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
            <Calendar className="size-4" />
            Select Date
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
            <Download className="size-4" />
            Export CSV
          </button>
        </div>
      </div>

      <BentoCard className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-slate-200 dark:border-white/10 text-sm outline-none focus:border-brand transition-all"
              placeholder="Search by ID or customer..."
              type="text"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/2 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {transactions.map((trx) => (
                <tr
                  key={trx.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors group"
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
                      <p className="font-medium">{trx.date}</p>
                      <p className="text-[10px] uppercase opacity-70 italic">
                        {trx.time}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {trx.customer}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 font-bold uppercase text-slate-500 dark:text-slate-400">
                      {trx.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {trx.id === "TRX-8818" ? (
                        <span className="text-slate-400 line-through">
                          {trx.total}
                        </span>
                      ) : (
                        trx.total
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        trx.status === "Completed" &&
                          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                        trx.status === "Cancelled" &&
                          "bg-rose-500/10 text-rose-500 border-rose-500/20",
                      )}
                    >
                      {trx.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                      <MoreHorizontal className="size-4" />
                    </button>
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
