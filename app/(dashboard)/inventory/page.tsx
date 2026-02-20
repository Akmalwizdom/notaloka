"use client";

import { BentoCard } from "@/components/ui/bento-card";
import {
  Package,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const products = [
  {
    id: "P-001",
    name: "Kopi Kenangan Mantan",
    category: "Beverage",
    price: "Rp 24.000",
    stock: 45,
    status: "In Stock",
  },
  {
    id: "P-002",
    name: "French Fries Large",
    category: "Snack",
    price: "Rp 18.000",
    stock: 12,
    status: "Low Stock",
  },
  {
    id: "P-003",
    name: "Ice Caramel Latte",
    category: "Beverage",
    price: "Rp 32.000",
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: "P-004",
    name: "Red Velvet Cake",
    category: "Bakery",
    price: "Rp 28.000",
    stock: 24,
    status: "In Stock",
  },
  {
    id: "P-005",
    name: "Plain Croissant",
    category: "Bakery",
    price: "Rp 15.000",
    stock: 8,
    status: "Low Stock",
  },
];

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Product Inventory
          </h1>
          <p className="text-sm text-slate-500">
            Manage your store products and stock levels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            <Filter className="size-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20">
            <Plus className="size-4" />
            Add Product
          </button>
        </div>
      </div>

      <BentoCard className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-slate-200 dark:border-white/10 text-sm outline-none focus:border-brand transition-all"
              placeholder="Search by name or SKU..."
              type="text"
            />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Showing 5 of 124 products
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/2 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-brand transition-colors">
                    Price <ArrowUpDown className="size-3" />
                  </div>
                </th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                        <Package className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter tabular-nums">
                          {product.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">
                    {product.price}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold">
                        {product.stock} pcs
                      </span>
                      <div className="w-24 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            product.stock > 20
                              ? "bg-emerald-500"
                              : product.stock > 0
                                ? "bg-amber-500"
                                : "bg-rose-500",
                          )}
                          style={{
                            width: `${Math.min((product.stock / 50) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        product.status === "In Stock" &&
                          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                        product.status === "Low Stock" &&
                          "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        product.status === "Out of Stock" &&
                          "bg-rose-500/10 text-rose-500 border-rose-500/20",
                      )}
                    >
                      {product.status === "Out of Stock" && (
                        <AlertCircle className="size-3" />
                      )}
                      {product.status}
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

        <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              Next
            </button>
          </div>
          <p className="text-xs text-slate-400">Page 1 of 25</p>
        </div>
      </BentoCard>
    </div>
  );
}
