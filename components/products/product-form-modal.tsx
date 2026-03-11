"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProductSchema, type CreateProductInput } from "@/lib/validations/product.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    categoryId?: string;
    image?: string;
  } | null;
  onSuccess?: () => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(CreateProductSchema) as any,
    defaultValues: {
      sku: "",
      name: "",
      price: 0,
      stock: 0,
      categoryId: "",
      image: "",
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku,
        name: product.name,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId || "",
        image: product.image || "",
      });
    } else {
      reset({
        sku: "",
        name: "",
        price: 0,
        stock: 0,
        categoryId: "",
        image: "",
      });
    }
  }, [product, reset]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.get<Category[]>("/api/v1/categories"),
  });

  const onSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    try {
      const url = product
        ? `/api/v1/products/${product.id}`
        : "/api/v1/products";
      const method = product ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save product");
      }

      toast.success(product ? "Product updated successfully" : "Product created successfully");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(product ? "Failed to update product" : "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                    <Package className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {product ? "Edit Product" : "Add New Product"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {product ? "Update product information" : "Fill in the product details"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="e.g., COF-001"
                    {...register("sku")}
                  />
                  {errors.sku && (
                    <p className="text-xs text-red-500">{errors.sku.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Cappuccino"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (Rp)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      {...register("price", { valueAsNumber: true })}
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      {...register("stock", { valueAsNumber: true })}
                    />
                    {errors.stock && (
                      <p className="text-xs text-red-500">{errors.stock.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <select
                    id="categoryId"
                    className="flex h-11 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("categoryId")}
                  >
                    <option value="">Select category</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL (optional)</Label>
                  <Input
                    id="image"
                    placeholder="https://example.com/image.jpg"
                    {...register("image")}
                  />
                  {errors.image && (
                    <p className="text-xs text-red-500">{errors.image.message}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="flex-1"
                  >
                    {product ? "Update" : "Create"} Product
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
