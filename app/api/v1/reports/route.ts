import { wrapHandler, successResponse } from "@/lib/api-utils";
import { ReportService } from "@/lib/services/report.service";

export const GET = wrapHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "daily";

  if (type === "daily") {
    const report = await ReportService.getDailyReport();
    return successResponse(report);
  }

  if (type === "monthly") {
    const report = await ReportService.getMonthlyReport();
    return successResponse(report);
  }

  if (type === "top-products") {
    const report = await ReportService.getTopProducts();
    return successResponse(report);
  }

  return successResponse({ message: "Invalid report type" }, 400);
});
