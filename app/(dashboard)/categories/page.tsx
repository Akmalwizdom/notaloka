"use client";

import { useState } from "react";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import {
  Folder,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CategoryModal } from "@/components/categories/category-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  _count?: {
    products: number;
  };
}

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.get<Category[]>("/api/v1/categories"),
  });

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/v1/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.code === "FOREIGN_KEY_CONSTRAINT") {
          toast.error("Cannot delete category with existing products");
          return;
        }
        throw new Error("Failed to delete category");
      }

      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <AlertCircle className="size-8 text-rose-500" />
        <p className="text-slate-500">Failed to load categories</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Categories
          </h1>
          <p className="text-sm text-slate-500">
            Organize your products into categories.
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="size-4" />
          Add Category
        </Button>
      </div>

      <BentoCard className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
          <p className="text-xs text-slate-500 font-medium">
            {categories?.length || 0} categorie(s)
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {categories?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <Folder className="size-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No categories yet
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Create your first category to organize products
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="size-4" />
                Add Category
              </Button>
            </div>
          ) : (
            categories?.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                    <Folder className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {category._count?.products || 0} product(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-brand transition-all"
                    title="Edit"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </BentoCard>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["categories"] });
        }}
      />
    </div>
  );
}
