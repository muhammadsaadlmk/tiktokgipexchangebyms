import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function getUserFromSession(req: Request) {
  const token = req.cookies?.["session_token"];
  if (!token) return null;
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.sessionToken, token))
    .limit(1);
  if (!session || session.expiresAt < new Date()) return null;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1);
  return user || null;
}

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    tiktokUsername: user.tiktokUsername,
    name: user.name ?? null,
    points: user.points,
    isAdmin: user.isAdmin,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
  };
}

router.post("/register", async (req: Request, res: Response) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password, tiktokUsername, name } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const cleanUsername = tiktokUsername.replace('@', '');
  const existingUsername = await db.select().from(usersTable).where(eq(usersTable.tiktokUsername, cleanUsername)).limit(1);
  if (existingUsername.length === 0) {
    const existingWithAt = await db.select().from(usersTable).where(eq(usersTable.tiktokUsername, `@${cleanUsername}`)).limit(1);
    if (existingWithAt.length > 0) {
      res.status(400).json({ error: "TikTok username already taken" });
      return;
    }
  } else {
    res.status(400).json({ error: "TikTok username already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ email, passwordHash, tiktokUsername, name: name?.trim() || null, points: 10 })
    .returning();

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(sessionsTable).values({ sessionToken: token, userId: user.id, expiresAt });

  res.cookie("session_token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: expiresAt });
  res.json({
    user: formatUser(user),
    message: "Registration successful! You have 10 points.",
  });
});

router.post("/login", async (req: Request, res: Response) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(sessionsTable).values({ sessionToken: token, userId: user.id, expiresAt });

  res.cookie("session_token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: expiresAt });
  res.json({
    user: formatUser(user),
    message: "Login successful!",
  });
});

router.patch("/me", async (req: Request, res: Response) => {
  const me = await getUserFromSession(req);
  if (!me) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { tiktokUsername, currentPassword, newPassword, avatarUrl } = req.body as {
    tiktokUsername?: string;
    currentPassword?: string;
    newPassword?: string;
    avatarUrl?: string | null;
  };

  const updates: Partial<{ tiktokUsername: string; passwordHash: string; avatarUrl: string | null }> = {};

  if (tiktokUsername && tiktokUsername.trim().length >= 2) {
    const clean = tiktokUsername.replace('@', '').trim();
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.tiktokUsername, clean))
      .limit(1);
    const existingAt = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.tiktokUsername, `@${clean}`))
      .limit(1);
    if (
      (existing.length > 0 && existing[0].id !== me.id) ||
      (existingAt.length > 0 && existingAt[0].id !== me.id)
    ) {
      res.status(400).json({ error: "TikTok username already taken" });
      return;
    }
    updates.tiktokUsername = clean;
  }

  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ error: "Current password is required to set a new password" });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, me.passwordHash);
    if (!valid) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "New password must be at least 6 characters" });
      return;
    }
    updates.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  if ("avatarUrl" in req.body) {
    updates.avatarUrl = avatarUrl ?? null;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, me.id))
    .returning();

  res.json(formatUser(updated));
});

router.post("/logout", async (req: Request, res: Response) => {
  const token = req.cookies?.["session_token"];
  if (token) {
    await db.delete(sessionsTable).where(eq(sessionsTable.sessionToken, token));
  }
  res.clearCookie("session_token");
  res.json({ message: "Logged out" });
});

router.get("/me", async (req: Request, res: Response) => {
  const user = await getUserFromSession(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(formatUser(user));
});

export { getUserFromSession };
export default router;
