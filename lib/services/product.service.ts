import prisma from "@/lib/prisma";
import { CreateProductInput, UpdateProductInput } from "../validations/product.schema";

export class ProductService {
  static async getAll() {
    return await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async getById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  static async getBySku(sku: string) {
    return await prisma.product.findUnique({
      where: { sku },
    });
  }

  static async create(data: CreateProductInput) {
    return await prisma.product.create({
      data,
    });
  }

  static async update(id: string, data: UpdateProductInput) {
    return await prisma.product.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  }

  static async search(query: string) {
    return await prisma.product.findMany({
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
  }
}
