import { wrapHandler, successResponse, AppError } from "@/lib/api-utils";
import { SyncService } from "@/lib/services/sync.service";
import { BulkSyncSchema } from "@/lib/validations/sync.schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const POST = wrapHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

  const body = await req.json();
  const validatedData = BulkSyncSchema.parse(body);

  const results = await SyncService.processBulkSync(session.user.id, validatedData);
  return successResponse(results);
});
