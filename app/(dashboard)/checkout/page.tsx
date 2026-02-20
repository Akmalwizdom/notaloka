"use client";

import { useState } from "react";
import { BentoCard } from "@/components/ui/bento-card";
import {
  Search,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  QrCode,
  ShoppingCart,
  Scan,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const products: Product[] = [
  {
    id: 1,
    name: "Kopi Kenangan Mantan",
    price: 24000,
    category: "Beverage",
    image: "☕",
  },
  {
    id: 2,
    name: "Ice Caramel Latte",
    price: 32000,
    category: "Beverage",
    image: "🥤",
  },
  {
    id: 3,
    name: "Red Velvet Cake",
    price: 28000,
    category: "Bakery",
    image: "🍰",
  },
  {
    id: 4,
    name: "French Fries Large",
    price: 18000,
    category: "Snack",
    image: "🍟",
  },
  {
    id: 5,
    name: "Plain Croissant",
    price: 15000,
    category: "Bakery",
    image: "🥐",
  },
  {
    id: 6,
    name: "Matcha Latte",
    price: 26000,
    category: "Beverage",
    image: "🍵",
  },
  {
    id: 7,
    name: "Chocolate Muffin",
    price: 22000,
    category: "Bakery",
    image: "🧁",
  },
  {
    id: 8,
    name: "Mineral Water",
    price: 8000,
    category: "Beverage",
    image: "💧",
  },
];

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm outline-none focus:border-brand transition-all"
              placeholder="Search products or scan barcode..."
              type="text"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-brand">
              <Scan className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {["All", "Beverage", "Snack", "Bakery"].map((cat) => (
              <button
                key={cat}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap",
                  cat === "All"
                    ? "bg-brand text-white border-brand"
                    : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:border-brand/50",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-brand transition-all text-left flex flex-col gap-3 active:scale-95"
              >
                <div className="aspect-square rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  {product.image}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Rp {product.price.toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <BentoCard className="w-96 flex flex-col p-0 overflow-hidden shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10 text-brand">
            <ShoppingCart className="size-5" />
          </div>
          <h3 className="font-bold text-lg">Current Order</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <ShoppingCart className="size-12 mb-4" />
                <p className="text-sm font-medium">Your cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg italic uppercase">
                      {item.image}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="size-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="size-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-slate-50/50 dark:bg-white/2 border-t border-slate-100 dark:border-white/5 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-bold">Rp {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tax (10%)</span>
              <span className="font-bold">Rp {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-slate-200 dark:border-white/10">
              <span className="font-black">Total</span>
              <span className="font-black text-brand">
                Rp {total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <PaymentMethod icon={Banknote} label="Cash" />
            <PaymentMethod icon={CreditCard} label="Card" />
            <PaymentMethod icon={QrCode} label="QRIS" />
          </div>

          <button
            disabled={cart.length === 0}
            className="w-full py-4 bg-brand text-white rounded-2xl font-black text-lg shadow-xl shadow-brand/20 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100"
          >
            Process Payment
          </button>
        </div>
      </BentoCard>
    </div>
  );
}

function PaymentMethod({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-brand hover:text-brand transition-all text-slate-500">
      <Icon className="size-5" />
      <span className="text-[10px] font-bold uppercase tracking-widest">
        {label}
      </span>
    </button>
  );
}
