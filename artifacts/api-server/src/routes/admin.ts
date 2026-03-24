import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, followsTable, settingsTable } from "@workspace/db";
import { eq, count, and, sql } from "drizzle-orm";
import { getUserFromSession } from "./auth";
import { AdminUpdateUserBody, AdminCreateUserBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  const me = await getUserFromSession(req);
  if (!me) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  if (!me.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }
  return true;
}

function userWithCounts(u: typeof usersTable.$inferSelect, followerCount: number, followingCount: number) {
  return {
    id: u.id,
    email: u.email,
    tiktokUsername: u.tiktokUsername,
    name: u.name ?? null,
    points: u.points,
    isAdmin: u.isAdmin,
    avatarUrl: u.avatarUrl ?? null,
    createdAt: u.createdAt,
    followersCount: followerCount,
    followingCount: followingCount,
  };
}

// ─── Ad Link types ────────────────────────────────────────────────────────────

interface AdLink {
  id: string;
  url: string;
  label: string;
  isActive: boolean;
  clicks: number;
}

async function getAdLinks(): Promise<AdLink[]> {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "adLinks")).limit(1);
  if (!row?.value) {
    // Migrate old adUrl if present
    const [oldRow] = await db.select().from(settingsTable).where(eq(settingsTable.key, "adUrl")).limit(1);
    if (oldRow?.value) {
      const migrated: AdLink[] = [{
        id: "default",
        url: oldRow.value,
        label: "Ad Link 1",
        isActive: true,
        clicks: 0,
      }];
      await saveAdLinks(migrated);
      return migrated;
    }
    return [];
  }
  try {
    return JSON.parse(row.value) as AdLink[];
  } catch {
    return [];
  }
}

async function saveAdLinks(links: AdLink[]): Promise<void> {
  const value = JSON.stringify(links);
  const [existing] = await db.select().from(settingsTable).where(eq(settingsTable.key, "adLinks")).limit(1);
  if (existing) {
    await db.update(settingsTable).set({ value, updatedAt: new Date() }).where(eq(settingsTable.key, "adLinks"));
  } else {
    await db.insert(settingsTable).values({ key: "adLinks", value });
  }
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ─── Platform Settings ────────────────────────────────────────────────────────

// Public endpoint — returns active links only (no click counts in public version)
router.get("/settings/public", async (_req: Request, res: Response) => {
  const links = await getAdLinks();
  const activeLinks = links.filter(l => l.isActive);
  res.json({ adLinks: activeLinks });
});

router.get("/settings", async (req: Request, res: Response) => {
  const ok = await requireAdmin(req, res);
  if (!ok) return;
  const links = await getAdLinks();
  res.json({ adLinks: links });
});

router.put("/settings", async (req: Request, res: Response) => {
  const ok = await requireAdmin(req, res);
  if (!ok) return;
  const { adLinks } = req.body as { adLinks?: AdLink[] };
  if (adLinks !== undefined) {
    await saveAdLinks(adLinks);
  }
  const saved = await getAdLinks();
  res.json({ adLinks: saved });
});

// Public endpoint — record a click on an ad link (no auth needed)
router.post("/settings/ad-click", async (req: Request, res: Response) => {
  const { adId } = req.body as { adId?: string };
  if (!adId) {
    res.status(400).json({ error: "adId required" });
    return;
  }
  const links = await getAdLinks();
  const idx = links.findIndex(l => l.id === adId);
  if (idx !== -1) {
    links[idx].clicks = (links[idx].clicks || 0) + 1;
    await saveAdLinks(links);
  }
  res.json({ message: "Click recorded" });
});

// ─── Users ────────────────────────────────────────────────────────────────────

router.get("/users", async (req: Request, res: Response) => {
  const ok = await requireAdmin(req, res);
  if (!ok) return;

  const users = await db.select().from(usersTable);

  const result = await Promise.all(
    users.map(async (u) => {
      const [{ count: fc }] = await db.select({ count: count() }).from(followsTable).where(eq(followsTable.followingId, u.id));
      const [{ count: ing }] = await db.select({ count: count() }).from(followsTable).where(eq(followsTable.followerId, u.id));
      return userWithCounts(u, Number(fc), Number(ing));
    })
  );

  res.json(result);
});

router.post("/users", async (req: Request, res: Response) => {
  const ok = await requireAdmin(req, res);
  if (!ok) return;

  const parsed = AdminCreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { email, password, tiktokUsername, name, points, isAdmin } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ email, passwordHash, tiktokUsername, name: name ?? null, points: points ?? 10, isAdmin: isAdmin ?? false })
    .returning();

  res.json(userWithCounts(user, 0, 0));
});

router.patch("/users/:userId", async (req: Request, res: Response) => {
  const ok = await requireAdmin(req, res);
  if (!ok) return;

  const userId = parseInt(req.params.userId as string);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }

  const parsed = AdminUpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const updates: Record<string, unknown> = {};
  if (parsed.data.email !== undefined) updates.email = parsed.data.email;
  if (parsed.data.tiktokUsername !== undefined) updates.tiktokUsername = parsed.data.tiktokUsername;
  if ("name" in parsed.data) updates.name = parsed.data.name ?? null;
  if (parsed.data.points !== undefined) {
    if (parsed.data.points > 999_999_999) {
      res.status(400).json({ error: "Points value too large. Maximum is 999,999,999." });
      return;
    }
    if (parsed.data.points < 0) {
      res.status(400).json({ error: "Points cannot be negative." });
      return;
    }
    updates.points = parsed.data.points;
  }
  if (parsed.data.isAdmin !== undefined) updates.isAdmin = parsed.data.isAdmin;
  if ("avatarUrl" in parsed.data) updates.avatarUrl = parsed.data.avatarUrl ?? null;
  if (parsed.data.password !== undefined && parsed.data.password.length >= 6) {
    updates.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }

  const [{ count: fc }] = await db.select({ count: count() }).from(followsTable).where(eq(followsTable.followingId, updated.id));
  const [{ count: ing }] = await db.select({ count: count() }).from(followsTable).where(eq(followsTable.followerId, updated.id));

  res.json(userWithCounts(updated, Number(fc), Number(ing)));
});

router.delete("/users/:userId", async (req: Request, res: Response) => {
  const ok = await requireAdmin(req, res);
  if (!ok) return;

  const userId = parseInt(req.params.userId as string);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }

  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, userId)).returning();
  if (!deleted) { res.status(404).json({ error: "User not found" }); return; }

  res.json({ message: `User @${deleted.tiktokUsername} deleted` });
});

// ─── Follows Management ───────────────────────────────────────────────────────

router.get("/follows", async (req: Request, res: Response) => {
  const ok = await requireAdmin(req, res);
  if (!ok) return;

  const follows = await db.select().from(followsTable);
  const allUsers = await db.select().from(usersTable);
  const userMap = Object.fromEntries(allUsers.map(u => [u.id, u.tiktokUsername]));

  const result = follows.map(f => ({
    id: f.id,
    followerId: f.followerId,
    followerUsername: userMap[f.followerId] ?? `#${f.followerId}`,
    followingId: f.followingId,
    followingUsername: userMap[f.followingId] ?? `#${f.followingId}`,
    createdAt: f.createdAt ?? new Date(),
  }));

  res.json(result);
});

router.post("/follows", async (req: Request, res: Response) => {
  const ok = await requireAdmin(req, res);
  if (!ok) return;

  const { followerId, followingId } = req.body as { followerId?: number; followingId?: number };
  if (!followerId || !followingId || followerId === followingId) {
    res.status(400).json({ error: "Invalid follower or following ID" });
    return;
  }

  const [existing] = await db.select().from(followsTable)
    .where(and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, followingId)))
    .limit(1);

  if (existing) {
    res.status(400).json({ error: "Follow relationship already exists" });
    return;
  }

  await db.insert(followsTable).values({ followerId, followingId });

  // Follower earns +1 point (they followed someone, capped at 999,999,999)
  await db.update(usersTable)
    .set({ points: sql`LEAST(999999999, ${usersTable.points} + 1)` })
    .where(eq(usersTable.id, followerId));

  // Following user loses -1 point (they gained a follower)
  await db.update(usersTable)
    .set({ points: sql`GREATEST(${usersTable.points} - 1, 0)` })
    .where(eq(usersTable.id, followingId));

  res.json({ message: "Follow relationship created. Points updated: follower +1, following user -1." });
});

router.delete("/follows/:followId", async (req: Request, res: Response) => {
  const ok = await requireAdmin(req, res);
  if (!ok) return;

  const followId = parseInt(req.params.followId as string);
  if (isNaN(followId)) { res.status(400).json({ error: "Invalid follow ID" }); return; }

  const [deleted] = await db.delete(followsTable).where(eq(followsTable.id, followId)).returning();
  if (!deleted) { res.status(404).json({ error: "Follow relationship not found" }); return; }

  // Reverse points: follower loses -1 (undo their earn), following user gains +1 back
  await db.update(usersTable)
    .set({ points: sql`GREATEST(${usersTable.points} - 1, 0)` })
    .where(eq(usersTable.id, deleted.followerId));

  await db.update(usersTable)
    .set({ points: sql`LEAST(999999999, ${usersTable.points} + 1)` })
    .where(eq(usersTable.id, deleted.followingId));

  res.json({ message: "Follow relationship removed. Points reversed: follower -1, following user +1." });
});

export default router;
