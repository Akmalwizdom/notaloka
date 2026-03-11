"use client";

import { useState, useCallback, useEffect } from "react";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import {
  Package,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  AlertCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { ProductFormModal } from "@/components/products/product-form-modal";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category?: {
    name: string;
  };
  categoryId?: string;
  image?: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", debouncedSearch],
    queryFn: () => {
      const query = debouncedSearch ? `/api/v1/products?q=${encodeURIComponent(debouncedSearch)}` : "/api/v1/products";
      return apiClient.get<Product[]>(query);
    },
  });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/v1/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-100 flex-col items-center justify-center gap-2">
        <AlertCircle className="size-8 text-rose-500" />
        <p className="text-slate-500">Failed to load products</p>
      </div>
    );
  }

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
          <Button variant="outline" disabled>
            <Filter className="size-4" />
            Filter
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="size-4" />
            Add Product
          </Button>
        </div>
      </div>

      <BentoCard className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-white dark:bg-background-dark border border-slate-200 dark:border-white/10 text-sm outline-none focus:border-brand transition-all"
              placeholder="Search by name or SKU..."
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
            Showing {products?.length || 0} products
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
              {products?.map((product) => {
                const stockStatus =
                  product.stock > 20
                    ? "In Stock"
                    : product.stock > 0
                      ? "Low Stock"
                      : "Out of Stock";

                return (
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
                            {product.sku || product.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">
                      Rp {new Intl.NumberFormat("id-ID").format(product.price)}
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
                          stockStatus === "In Stock" &&
                            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                          stockStatus === "Low Stock" &&
                            "bg-amber-500/10 text-amber-500 border-amber-500/20",
                          stockStatus === "Out of Stock" &&
                            "bg-rose-500/10 text-rose-500 border-rose-500/20",
                        )}
                      >
                        {stockStatus === "Out of Stock" && (
                          <AlertCircle className="size-3" />
                        )}
                        {stockStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-brand transition-all"
                          title="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
          <p className="text-xs text-slate-400">Page 1 of 1</p>
        </div>
      </BentoCard>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
        }}
      />
    </div>
  );
}
