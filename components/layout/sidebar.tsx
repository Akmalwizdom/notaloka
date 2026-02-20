"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ReceiptText,
  BarChart3,
  Settings,
  LogOut,
  CreditCard,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Checkout", href: "/checkout", icon: ShoppingCart },
  { label: "Transactions", href: "/transactions", icon: ReceiptText },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-white/10 flex flex-col bg-background-light dark:bg-background-dark h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-brand rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand/20">
          <CreditCard className="size-6 font-bold" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">Notaloka</h1>
          <p className="text-xs text-slate-500 dark:text-brand/70 font-medium uppercase tracking-wider">
            POS Intelligence
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-brand/10 text-brand font-semibold shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "size-5 transition-transform group-hover:scale-110",
                  isActive && "text-primary",
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/10">
        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl flex items-center gap-3 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors">
          <div className="size-10 rounded-full bg-brand/20 flex items-center justify-center overflow-hidden">
            <span className="text-brand font-bold">BS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
              Budi Santoso
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Store Manager
            </p>
          </div>
          <button className="text-slate-400 hover:text-red-500 transition-colors">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
