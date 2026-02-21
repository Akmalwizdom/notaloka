import { wrapHandler, successResponse } from "@/lib/api-utils";
import { ProductService } from "@/lib/services/product.service";
import { CreateProductSchema } from "@/lib/validations/product.schema";

export const GET = wrapHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (query) {
    const products = await ProductService.search(query);
    return successResponse(products);
  }

  const products = await ProductService.getAll();
  return successResponse(products);
});

export const POST = wrapHandler(async (req: Request) => {
  const body = await req.json();
  const validatedData = CreateProductSchema.parse(body);
  const product = await ProductService.create(validatedData);
  return successResponse(product, 201);
});
