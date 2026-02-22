import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for Prisma");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // 1. Create Categories
  const foodCategory = await prisma.category.upsert({
    where: { name: 'Food' },
    update: {},
    create: { name: 'Food' },
  });

  const drinkCategory = await prisma.category.upsert({
    where: { name: 'Drink' },
    update: {},
    create: { name: 'Drink' },
  });

  console.log('Categories created or updated.');

  const products = [
    // --- Food (15 items) ---
    {
      sku: 'FOOD-001',
      name: 'Nasi Goreng Spesial',
      price: 25000,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-002',
      name: 'Mie Ayam Pangsit',
      price: 18000,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-003',
      name: 'Sate Ayam Madura',
      price: 22000,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-004',
      name: 'Bakso Sapi Urat',
      price: 15000,
      stock: 100,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-005',
      name: 'Gado-Gado Betawi',
      price: 17000,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-006',
      name: 'Ayam Goreng Penyet',
      price: 20000,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-007',
      name: 'Rendang Sapi',
      price: 35000,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-008',
      name: 'Soto Ayam Lamongan',
      price: 16000,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-009',
      name: 'Pempek Kapal Selam',
      price: 25000,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-010',
      name: 'Martabak Manis Cokelat',
      price: 30000,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-011',
      name: 'Nasi Uduk Komplit',
      price: 20000,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-012',
      name: 'Burger Sapi Keju',
      price: 28000,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-013',
      name: 'Pizza Margherita',
      price: 45000,
      stock: 10,
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-014',
      name: 'Pasta Carbonara',
      price: 32000,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },
    {
      sku: 'FOOD-015',
      name: 'Kebab Turki',
      price: 15000,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=60',
      categoryId: foodCategory.id,
    },

    // --- Drink (15 items) ---
    {
      sku: 'DRINK-001',
      name: 'Es Teh Manis',
      price: 5000,
      stock: 200,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-002',
      name: 'Es Jeruk Segar',
      price: 7000,
      stock: 150,
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-003',
      name: 'Kopi Hitam Toraja',
      price: 10000,
      stock: 100,
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-004',
      name: 'Cappuccino Hot',
      price: 15000,
      stock: 80,
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-005',
      name: 'Es Cokelat Premium',
      price: 12000,
      stock: 60,
      image: 'https://images.unsplash.com/photo-1544145945-8c366624d08b?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-006',
      name: 'Jus Alpukat',
      price: 12000,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-007',
      name: 'Thai Tea Ice',
      price: 10000,
      stock: 90,
      image: 'https://images.unsplash.com/photo-1502998070258-dc1338445ac2?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-008',
      name: 'Green Tea Latte',
      price: 15000,
      stock: 70,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-009',
      name: 'Soda Gembira',
      price: 10000,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-010',
      name: 'Mineral Water',
      price: 4000,
      stock: 300,
      image: 'https://images.unsplash.com/photo-1523362622666-18d0fd50055c?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-011',
      name: 'Es Campur',
      price: 12000,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-012',
      name: 'Boba Milk Tea',
      price: 18000,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-013',
      name: 'Lemonade Ice',
      price: 8000,
      stock: 100,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-014',
      name: 'Mango Smoothie',
      price: 15000,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1542729779-11d8fe8e25f6?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
    {
      sku: 'DRINK-015',
      name: 'Hot Chocolate',
      price: 12000,
      stock: 60,
      image: 'https://images.unsplash.com/photo-1538587888044-79f13ddd7e49?auto=format&fit=crop&w=800&q=60',
      categoryId: drinkCategory.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        price: product.price,
        stock: product.stock,
        image: product.image,
        categoryId: product.categoryId,
      },
      create: product,
    });
  }

  console.log(`Seeding finished. ${products.length} products seeded.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
