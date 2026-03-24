import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const ADMIN_EMAIL = "muhammadsaadlmk@admin.com";
const ADMIN_PASSWORD = "P@ssword!6615mk";
const ADMIN_TIKTOK = "muhammadsaadlmk";
const ADMIN_NAME = "Muhammad Saad";
const ADMIN_POINTS = 999_999_999;

export async function seedAdminUser() {
  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, ADMIN_EMAIL))
      .limit(1);

    if (existing.length > 0) {
      if (!existing[0].isAdmin) {
        await db
          .update(usersTable)
          .set({ isAdmin: true, points: ADMIN_POINTS })
          .where(eq(usersTable.email, ADMIN_EMAIL));
        logger.info("Admin user promoted to admin");
      } else {
        logger.info("Admin user already exists — skipping seed");
      }
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.insert(usersTable).values({
      email: ADMIN_EMAIL,
      passwordHash,
      tiktokUsername: ADMIN_TIKTOK,
      name: ADMIN_NAME,
      points: ADMIN_POINTS,
      isAdmin: true,
    });

    logger.info({ email: ADMIN_EMAIL }, "Admin user created successfully");
  } catch (err) {
    logger.error({ err }, "Failed to seed admin user");
  }
}
