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
  X,
  Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { signOut } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Categories", href: "/categories", icon: Folder },
  { label: "Checkout", href: "/checkout", icon: ShoppingCart },
  { label: "Transactions", href: "/transactions", icon: ReceiptText },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const SidebarContent = (
    <aside className="w-64 border-r border-slate-200 dark:border-white/10 flex flex-col bg-background-light dark:bg-background-dark h-screen sticky top-0 shadow-xl lg:shadow-none">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-brand/10 text-brand font-semibold shadow-sm ring-1 ring-brand/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "size-5 transition-transform group-hover:scale-110",
                  isActive && "text-brand",
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/10">
        {isPending ? (
          <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl flex items-center gap-3">
            <Loader2 className="size-4 animate-spin text-brand" />
            <span className="text-xs text-slate-500">Loading...</span>
          </div>
        ) : session?.user ? (
          <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl flex items-center gap-3 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors">
            <div className="size-10 rounded-full bg-brand/20 flex items-center justify-center overflow-hidden">
              <span className="text-brand font-bold text-sm">
                {getInitials(session.user.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                {session.user.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {session.user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen">{SidebarContent}</div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
