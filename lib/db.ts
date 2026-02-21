import Dexie, { type Table } from "dexie";

export interface LocalProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  updatedAt: string;
}

export interface LocalTransaction {
  id?: number;
  offlineId: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  isSynced: number; // 0 for no, 1 for yes
}

export class NotalokaDB extends Dexie {
  products!: Table<LocalProduct>;
  transactions!: Table<LocalTransaction>;

  constructor() {
    super("NotalokaDB");
    this.version(1).stores({
      products: "id, name, categoryId",
      transactions: "++id, offlineId, isSynced, createdAt",
    });
  }
}

export const db = new NotalokaDB();
