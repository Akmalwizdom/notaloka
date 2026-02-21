"use client";

import { useEffect, useState } from "react";
import { db, type LocalProduct } from "@/lib/db";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const syncProducts = async () => {
    try {
      const products = await apiClient.get<LocalProduct[]>("/api/v1/products");
      await db.products.clear();
      await db.products.bulkAdd(
        products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          categoryId: p.categoryId,
          updatedAt: p.updatedAt,
        }))
      );
    } catch (error) {
      console.error("Failed to sync products to local DB", error);
    }
  };

  const syncTransactions = async () => {
    const pendingTransactions = await db.transactions
      .where("isSynced")
      .equals(0)
      .toArray();

    if (pendingTransactions.length === 0) return;

    setIsSyncing(true);
    try {
      const payload = pendingTransactions.map((t) => ({
        offlineId: t.offlineId,
        items: t.items,
        paymentMethod: t.paymentMethod,
        paymentStatus: t.paymentStatus,
        createdAt: t.createdAt,
      }));

      await apiClient.post("/api/v1/sync", { transactions: payload });

      // Mark as synced locally
      await db.transactions
        .where("offlineId")
        .anyOf(pendingTransactions.map((t) => t.offlineId))
        .modify({ isSynced: 1 });

      setLastSyncAt(new Date());
      toast.success(`Synced ${pendingTransactions.length} transactions`);
    } catch (error) {
      console.error("Sync failed", error);
      toast.error("Failed to sync offline transactions");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Initial sync
    syncProducts();
    syncTransactions();

    // Set up periodic sync (every 30 seconds)
    const interval = setInterval(syncTransactions, 30000);

    // Listen for online/offline events
    const handleOnline = () => {
      toast.info("Back online. Starting sync...");
      syncTransactions();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return { isSyncing, lastSyncAt, syncTransactions, syncProducts };
}
