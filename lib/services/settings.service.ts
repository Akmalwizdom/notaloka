import prisma from "@/lib/prisma";
import { UpdateSettingsInput } from "../validations/settings.schema";

export class SettingsService {
  /**
   * Get store settings. Creates the singleton record with defaults if it doesn't exist yet.
   */
  static async get() {
    return await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });
  }

  /**
   * Update store settings. Uses upsert so the record is always guaranteed to exist.
   */
  static async update(data: UpdateSettingsInput) {
    return await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
  }
}
