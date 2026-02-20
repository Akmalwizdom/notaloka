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
  const [isCartOpen, setIsCartOpen] = useState(false);

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
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const CartContent = (
    <BentoCard className="w-full lg:w-96 flex flex-col p-0 overflow-hidden shrink-0 h-full lg:h-full border-none lg:border lg:border-slate-200 lg:dark:border-white/10 rounded-none lg:rounded-2xl">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10 text-brand">
            <ShoppingCart className="size-5" />
          </div>
          <h3 className="font-bold text-lg">Current Order</h3>
        </div>
        <button
          onClick={() => setIsCartOpen(false)}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          <Plus className="size-5 rotate-45" />
        </button>
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
                    className="size-8 md:size-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="size-8 md:size-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
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
  );

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-120px)] gap-6 overflow-hidden relative">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm outline-none focus:border-brand transition-all"
              placeholder="Search products or scan..."
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

      {/* Cart Desktop Sidebar */}
      <div className="hidden lg:block h-full">{CartContent}</div>

      {/* Floating View Cart Button (Mobile) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:hidden z-20 w-[calc(100%-2rem)] max-w-md">
        <button
          onClick={() => setIsCartOpen(true)}
          className="w-full h-14 bg-brand text-white rounded-2xl font-bold flex items-center justify-between px-6 shadow-2xl shadow-brand/40 animate-in slide-in-from-bottom"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="size-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 size-5 bg-white text-brand rounded-full text-[10px] flex items-center justify-center border-2 border-brand">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span>View Cart</span>
          </div>
          <span className="font-black">Rp {total.toLocaleString()}</span>
        </button>
      </div>

      {/* Mobile Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 top-10 bg-background-light dark:bg-background-dark rounded-t-3xl overflow-hidden"
            >
              {CartContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
