import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/index";
import { follows } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST - toggle follow/unfollow
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { userId: targetUserId } = await req.json();
  if (!targetUserId) {
    return NextResponse.json({ error: "userId обязателен" }, { status: 400 });
  }

  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: "Нельзя подписаться на себя" }, { status: 400 });
  }

  const existing = await db.query.follows.findFirst({
    where: and(
      eq(follows.followerId, session.user.id),
      eq(follows.followingId, targetUserId)
    ),
  });

  if (existing) {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, session.user.id),
          eq(follows.followingId, targetUserId)
        )
      );
    return NextResponse.json({ following: false });
  } else {
    await db.insert(follows).values({
      followerId: session.user.id,
      followingId: targetUserId,
    });
    return NextResponse.json({ following: true });
  }
}

// GET - check if following a user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId");

  if (!targetUserId) {
    return NextResponse.json({ error: "userId обязателен" }, { status: 400 });
  }

  const existing = await db.query.follows.findFirst({
    where: and(
      eq(follows.followerId, session.user.id),
      eq(follows.followingId, targetUserId)
    ),
  });

  return NextResponse.json({ following: !!existing });
}
