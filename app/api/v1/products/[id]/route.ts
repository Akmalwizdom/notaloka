import { wrapHandler, successResponse, AppError } from "@/lib/api-utils";
import { ProductService } from "@/lib/services/product.service";
import { UpdateProductSchema } from "@/lib/validations/product.schema";

export const GET = wrapHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const product = await ProductService.getById(params.id);
  if (!product) throw new AppError("Product not found", 404, "NOT_FOUND");
  return successResponse(product);
});

export const PATCH = wrapHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const validatedData = UpdateProductSchema.parse(body);
  const product = await ProductService.update(params.id, validatedData);
  return successResponse(product);
});

export const DELETE = wrapHandler(async (req: Request, { params }: { params: { id: string } }) => {
  await ProductService.delete(params.id);
  return successResponse({ message: "Product deleted" });
});
