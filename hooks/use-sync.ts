"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { db, type LocalProduct } from "@/lib/db";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

const PRODUCT_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 menit
const TRANSACTION_SYNC_INTERVAL_MS = 30 * 1000; // 30 detik
const STORAGE_KEY = "notaloka:lastProductSync";

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  // Gunakan ref untuk mencegah syncTransactions dipanggil ganda saat interval + online event
  const isSyncingRef = useRef(false);

  /**
   * OPTIMIZED: Hanya fetch ke server jika data produk sudah stale (> 5 menit).
   * Sebelumnya: selalu fetch ulang SEMUA produk setiap kali layout dashboard mount.
   * Sekarang: skip jika data masih segar, cukup andalkan IndexedDB lokal.
   */
  const syncProducts = useCallback(async () => {
    try {
      const lastSync = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();

      if (lastSync && now - Number(lastSync) < PRODUCT_SYNC_INTERVAL_MS) {
        // Data masih segar, tidak perlu fetch ulang
        return;
      }

      const products = await apiClient.get<LocalProduct[]>("/api/v1/products");

      await db.products.clear();
      await db.products.bulkPut(
        products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          categoryId: p.categoryId,
          updatedAt: p.updatedAt,
        })),
      );

      localStorage.setItem(STORAGE_KEY, String(now));
    } catch (error) {
      console.error("[Sync] Failed to sync products to local DB:", error);
    }
  }, []);

  const syncTransactions = useCallback(async () => {
    // Cegah eksekusi ganda (interval + online event bisa trigger bersamaan)
    if (isSyncingRef.current) return;

    const pendingTransactions = await db.transactions
      .where("isSynced")
      .equals(0)
      .toArray();

    if (pendingTransactions.length === 0) return;

    isSyncingRef.current = true;
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

      await db.transactions
        .where("offlineId")
        .anyOf(pendingTransactions.map((t) => t.offlineId))
        .modify({ isSynced: 1 });

      setLastSyncAt(new Date());
      toast.success(`Synced ${pendingTransactions.length} transaction(s)`);
    } catch (error) {
      console.error("[Sync] Failed to sync offline transactions:", error);
      toast.error("Failed to sync offline transactions");
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Sync saat pertama mount (syncProducts hanya jalan jika stale)
    syncProducts();
    syncTransactions();

    // Cek pending transactions secara periodik
    const interval = setInterval(
      syncTransactions,
      TRANSACTION_SYNC_INTERVAL_MS,
    );

    const handleOnline = () => {
      toast.info("Back online. Syncing...");
      // Saat kembali online, paksa refresh produk juga
      localStorage.removeItem(STORAGE_KEY);
      syncProducts();
      syncTransactions();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
    };
  }, [syncProducts, syncTransactions]);

  return { isSyncing, lastSyncAt, syncTransactions, syncProducts };
}
