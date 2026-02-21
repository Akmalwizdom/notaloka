import prisma from "@/lib/prisma";
import { CategoryInput } from "../validations/category.schema";

export class CategoryService {
  static async getAll() {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async create(data: CategoryInput) {
    return await prisma.category.create({
      data,
    });
  }

  static async update(id: string, data: CategoryInput) {
    return await prisma.category.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return await prisma.category.delete({
      where: { id },
    });
  }
}
