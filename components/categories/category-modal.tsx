"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

type CategoryInput = z.infer<typeof CategorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: {
    id: string;
    name: string;
  } | null;
  onSuccess?: () => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (category) {
      reset({ name: category.name });
    } else {
      reset({ name: "" });
    }
  }, [category, reset]);

  const onSubmit = async (data: CategoryInput) => {
    setIsSubmitting(true);
    try {
      const url = category
        ? `/api/v1/categories/${category.id}`
        : "/api/v1/categories";
      const method = category ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save category");
      }

      toast.success(category ? "Category updated successfully" : "Category created successfully");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(category ? "Failed to update category" : "Failed to create category");
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
                    <Folder className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {category ? "Edit Category" : "Add New Category"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {category ? "Update category information" : "Create a new category"}
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
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Coffee, Food, Snacks"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
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
                    {category ? "Update" : "Create"} Category
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
