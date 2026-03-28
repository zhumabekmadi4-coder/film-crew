import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { messages, conversationParticipants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getMessages } from "@/db/queries/messages";
import { redis } from "@/lib/redis";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const after = req.nextUrl.searchParams.get("after") || undefined;

  const part = await db.query.conversationParticipants.findFirst({
    where: and(
      eq(conversationParticipants.conversationId, id),
      eq(conversationParticipants.userId, session.user.id)
    ),
  });
  if (!part) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const msgs = await getMessages(id, after);
  return NextResponse.json(msgs);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();

  const part = await db.query.conversationParticipants.findFirst({
    where: and(
      eq(conversationParticipants.conversationId, id),
      eq(conversationParticipants.userId, session.user.id)
    ),
  });
  if (!part) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [msg] = await db
    .insert(messages)
    .values({ conversationId: id, senderId: session.user.id, content })
    .returning();

  // Push to Redis for SSE subscribers
  const channelKey = `chat:${id}:msgs`;
  const payload = JSON.stringify({
    ...msg,
    senderName: session.user.name,
    senderAvatar: null,
  });
  await redis.rpush(channelKey, payload);
  await redis.expire(channelKey, 3600); // TTL 1 hour

  return NextResponse.json(msg);
}
