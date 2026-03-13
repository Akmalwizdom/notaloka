import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { ReportsView } from "@/components/reports/reports-view";
import { ReportService } from "@/lib/services/report.service";

export default async function ReportsPage() {
  const queryClient = getQueryClient();

  // Prefetch semua 3 query secara paralel agar tidak ada waterfall di server.
  // Query keys harus sama persis dengan yang dipakai di ReportsView.
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["reports", "daily"],
      queryFn: () => ReportService.getDailyReport(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["reports", "monthly"],
      queryFn: () => ReportService.getMonthlyReport(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["reports", "top-products"],
      queryFn: () => ReportService.getTopProducts(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReportsView />
    </HydrationBoundary>
  );
}
