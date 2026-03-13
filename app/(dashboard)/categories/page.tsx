import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { CategoriesView } from "@/components/categories/categories-view";
import { CategoryService } from "@/lib/services/category.service";

export default async function CategoriesPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["categories"],
    queryFn: () => CategoryService.getAll(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoriesView />
    </HydrationBoundary>
  );
}
