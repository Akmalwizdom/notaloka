import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { InventoryView } from "@/components/products/inventory-view";
import { ProductService } from "@/lib/services/product.service";

export default async function InventoryPage() {
  const queryClient = getQueryClient();

  // Prefetch produk tanpa search query (initial load).
  // Query key ["products", ""] cocok dengan queryKey di InventoryView saat debouncedSearch="".
  await queryClient.prefetchQuery({
    queryKey: ["products", ""],
    queryFn: () => ProductService.getAll(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InventoryView />
    </HydrationBoundary>
  );
}
