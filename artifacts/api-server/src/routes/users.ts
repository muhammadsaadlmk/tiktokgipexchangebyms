import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, followsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getUserFromSession } from "./auth";

const router: IRouter = Router();

router.get("/", async (req: Request, res: Response) => {
  const me = await getUserFromSession(req);
  const allUsers = await db.select().from(usersTable);

  let myFollowing: number[] = [];
  let myFollowers: number[] = [];

  if (me) {
    const following = await db.select().from(followsTable).where(eq(followsTable.followerId, me.id));
    myFollowing = following.map((f) => f.followingId);

    const followers = await db.select().from(followsTable).where(eq(followsTable.followingId, me.id));
    myFollowers = followers.map((f) => f.followerId);
  }

  const result = allUsers
    .filter((u) => !me || u.id !== me.id)
    .map((u) => ({
      id: u.id,
      tiktokUsername: u.tiktokUsername,
      name: u.name ?? null,
      points: u.points,
      avatarUrl: u.avatarUrl ?? null,
      isFollowedByMe: myFollowing.includes(u.id),
      followsMeBack: myFollowers.includes(u.id),
    }));

  res.json(result);
});

router.get("/:userId", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId as string);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const me = await getUserFromSession(req);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  let isFollowedByMe = false;
  let followsMeBack = false;

  if (me) {
    const [fwd] = await db
      .select()
      .from(followsTable)
      .where(and(eq(followsTable.followerId, me.id), eq(followsTable.followingId, userId)))
      .limit(1);
    isFollowedByMe = !!fwd;

    const [rev] = await db
      .select()
      .from(followsTable)
      .where(and(eq(followsTable.followerId, userId), eq(followsTable.followingId, me.id)))
      .limit(1);
    followsMeBack = !!rev;
  }

  res.json({
    id: user.id,
    tiktokUsername: user.tiktokUsername,
    name: user.name ?? null,
    points: user.points,
    avatarUrl: user.avatarUrl ?? null,
    isFollowedByMe,
    followsMeBack,
  });
});

export default router;
