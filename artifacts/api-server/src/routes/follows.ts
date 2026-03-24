import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, followsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { getUserFromSession } from "./auth";

const router: IRouter = Router();

router.get("/", async (req: Request, res: Response) => {
  const me = await getUserFromSession(req);
  if (!me) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const followingRows = await db
    .select()
    .from(followsTable)
    .where(eq(followsTable.followerId, me.id));

  const followerRows = await db
    .select()
    .from(followsTable)
    .where(eq(followsTable.followingId, me.id));

  const followingIds = followingRows.map((f) => f.followingId);
  const followerIds = followerRows.map((f) => f.followerId);

  const allIds = [...new Set([...followingIds, ...followerIds])];

  let usersMap: Record<number, { id: number; tiktokUsername: string; points: number; avatarUrl: string | null }> = {};
  if (allIds.length > 0) {
    const users = await db.select().from(usersTable);
    for (const u of users) {
      if (allIds.includes(u.id)) {
        usersMap[u.id] = { id: u.id, tiktokUsername: u.tiktokUsername, points: u.points, avatarUrl: u.avatarUrl ?? null };
      }
    }
  }

  res.json({
    following: followingIds.map((id) => usersMap[id]).filter(Boolean),
    followers: followerIds.map((id) => usersMap[id]).filter(Boolean),
  });
});

// POST /follows/:targetUserId
// Clicker (+1 point) visits target's TikTok link.
// Target (-1 point) pays for receiving a follower.
router.post("/:targetUserId", async (req: Request, res: Response) => {
  const me = await getUserFromSession(req);
  if (!me) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const targetUserId = parseInt(req.params.targetUserId as string);
  if (isNaN(targetUserId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  if (targetUserId === me.id) {
    res.status(400).json({ error: "You cannot follow yourself" });
    return;
  }

  const [target] = await db.select().from(usersTable).where(eq(usersTable.id, targetUserId)).limit(1);
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (target.points < 1) {
    res.status(400).json({ error: "This user has no points left to offer a reward" });
    return;
  }

  const [alreadyFollowing] = await db
    .select()
    .from(followsTable)
    .where(and(eq(followsTable.followerId, me.id), eq(followsTable.followingId, targetUserId)))
    .limit(1);

  if (alreadyFollowing) {
    res.status(400).json({ error: "You already followed this user's TikTok" });
    return;
  }

  await db.insert(followsTable).values({ followerId: me.id, followingId: targetUserId });

  // Clicker earns +1 point (capped at 999,999,999)
  await db
    .update(usersTable)
    .set({ points: sql`LEAST(999999999, ${usersTable.points} + 1)` })
    .where(eq(usersTable.id, me.id));

  // Target loses -1 point (pays for getting a follower)
  await db
    .update(usersTable)
    .set({ points: sql`GREATEST(0, ${usersTable.points} - 1)` })
    .where(eq(usersTable.id, targetUserId));

  const [updatedMe] = await db.select().from(usersTable).where(eq(usersTable.id, me.id)).limit(1);

  res.json({
    message: `You visited @${target.tiktokUsername} on TikTok! You earned 1 point.`,
    myPoints: updatedMe.points,
  });
});

// DELETE /follows/:targetUserId — undo a TikTok follow visit
// Clicker loses the +1 they earned, target gets their -1 back.
router.delete("/:targetUserId", async (req: Request, res: Response) => {
  const me = await getUserFromSession(req);
  if (!me) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const targetUserId = parseInt(req.params.targetUserId as string);
  if (isNaN(targetUserId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const [target] = await db.select().from(usersTable).where(eq(usersTable.id, targetUserId)).limit(1);
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [followRow] = await db
    .select()
    .from(followsTable)
    .where(and(eq(followsTable.followerId, me.id), eq(followsTable.followingId, targetUserId)))
    .limit(1);

  if (!followRow) {
    res.status(400).json({ error: "You have not followed this user" });
    return;
  }

  await db
    .delete(followsTable)
    .where(and(eq(followsTable.followerId, me.id), eq(followsTable.followingId, targetUserId)));

  // Clicker loses the point they earned
  await db
    .update(usersTable)
    .set({ points: sql`GREATEST(0, ${usersTable.points} - 1)` })
    .where(eq(usersTable.id, me.id));

  // Target gets their point back (capped at 999,999,999)
  await db
    .update(usersTable)
    .set({ points: sql`LEAST(999999999, ${usersTable.points} + 1)` })
    .where(eq(usersTable.id, targetUserId));

  res.json({ message: `Removed visit for @${target.tiktokUsername}` });
});

export default router;
