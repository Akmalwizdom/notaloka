import prisma from "@/lib/prisma";
import { CreateProductInput, UpdateProductInput } from "../validations/product.schema";

/** Convert Prisma Decimal fields to plain numbers so data is serialisable across the RSC boundary. */
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_key, value) =>
    typeof value === "object" && value !== null && value.constructor?.name === "Decimal"
      ? Number(value)
      : value
  ));
}

export class ProductService {
  static async getAll() {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return serialize(products);
  }

  static async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    return product ? serialize(product) : null;
  }

  static async getBySku(sku: string) {
    const product = await prisma.product.findUnique({
      where: { sku },
    });
    return product ? serialize(product) : null;
  }

  static async create(data: CreateProductInput) {
    const product = await prisma.product.create({
      data,
    });
    return serialize(product);
  }

  static async update(id: string, data: UpdateProductInput) {
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    return serialize(product);
  }

  static async delete(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  }

  static async search(query: string) {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
      },
    });
    return serialize(products);
  }
}
