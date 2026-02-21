import { wrapHandler, successResponse } from "@/lib/api-utils";
import { CategoryService } from "@/lib/services/category.service";
import { CategorySchema } from "@/lib/validations/category.schema";

export const GET = wrapHandler(async () => {
  const categories = await CategoryService.getAll();
  return successResponse(categories);
});

export const POST = wrapHandler(async (req: Request) => {
  const body = await req.json();
  const validatedData = CategorySchema.parse(body);
  const category = await CategoryService.create(validatedData);
  return successResponse(category, 201);
});
