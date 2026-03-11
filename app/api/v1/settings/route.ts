import { wrapHandler, successResponse, AppError } from "@/lib/api-utils";
import { SettingsService } from "@/lib/services/settings.service";
import { UpdateSettingsSchema } from "@/lib/validations/settings.schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const GET = wrapHandler(async () => {
  const settings = await SettingsService.get();
  return successResponse(settings);
});

export const PATCH = wrapHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

  const body = await req.json();
  const validatedData = UpdateSettingsSchema.parse(body);
  const settings = await SettingsService.update(validatedData);
  return successResponse(settings);
});
