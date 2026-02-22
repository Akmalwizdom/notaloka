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
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  category: { name: string };
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

// Static mock products removed

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.get<Product[]>("/api/v1/products"),
  });

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

  const updateQuantity = (id: string, delta: number) => {
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

  const handleProcessPayment = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: paymentMethod.toLowerCase(),
      };

      const result = await apiClient.post<{ snapToken?: string }>("/api/v1/checkout", payload);

      if (paymentMethod === "QRIS" || paymentMethod === "Card") {
        if (result.snapToken) {
          // @ts-expect-error Snap is provided by Midtrans script in layout/head
          window.snap.pay(result.snapToken, {
            onSuccess: () => {
              toast.success("Payment successful!");
              setCart([]);
              setIsProcessing(false);
            },
            onPending: () => {
              toast.info("Payment is pending.");
              setCart([]);
              setIsProcessing(false);
            },
            onError: () => {
              toast.error("Payment failed.");
              setIsProcessing(false);
            },
            onClose: () => {
              toast.warning("Payment popup closed.");
              setIsProcessing(false);
            },
          });
        }
      } else {
        toast.success("Transaction recorded (Cash)");
        setCart([]);
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error("Checkout failed. Please try again.");
      console.error(error);
      setIsProcessing(false);
    }
  };

  const filteredProducts = products?.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category.name === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                  <div className="size-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg italic uppercase overflow-hidden relative">
                    {item.image?.startsWith("http") ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      item.image || "☕"
                    )}
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
          <PaymentMethod
            icon={Banknote}
            label="Cash"
            selected={paymentMethod === "Cash"}
            onClick={() => setPaymentMethod("Cash")}
          />
          <PaymentMethod
            icon={CreditCard}
            label="Card"
            selected={paymentMethod === "Card"}
            onClick={() => setPaymentMethod("Card")}
          />
          <PaymentMethod
            icon={QrCode}
            label="QRIS"
            selected={paymentMethod === "QRIS"}
            onClick={() => setPaymentMethod("QRIS")}
          />
        </div>

        <button
          onClick={handleProcessPayment}
          disabled={cart.length === 0 || isProcessing}
          className="w-full py-4 bg-brand text-white rounded-2xl font-black text-lg shadow-xl shadow-brand/20 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2"
        >
          {isProcessing && <Loader2 className="size-5 animate-spin" />}
          {isProcessing ? "Processing..." : "Process Payment"}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-brand">
              <Scan className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {["All", "Food", "Drink"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap",
                  cat === selectedCategory
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
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="size-8 animate-spin text-brand" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts?.length === 0 ? (
                <div className="col-span-full h-40 flex flex-col items-center justify-center text-center opacity-40">
                  <AlertCircle className="size-8 mb-2" />
                  <p className="text-sm">No products found</p>
                </div>
              ) : (
                filteredProducts?.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-brand transition-all text-left flex flex-col gap-3 active:scale-95"
                  >
                    <div className="aspect-square rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform overflow-hidden relative">
                      {product.image?.startsWith("http") ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        product.image || "☕"
                      )}
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
                ))
              )}
            </div>
          )}
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
  selected,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all",
        selected
          ? "border-brand bg-brand/5 text-brand"
          : "border-slate-200 dark:border-white/10 text-slate-500 hover:border-brand/50",
      )}
    >
      <Icon className="size-5" />
      <span className="text-[10px] font-bold uppercase tracking-widest">
        {label}
      </span>
    </button>
  );
}
