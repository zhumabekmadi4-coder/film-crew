import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { conversationParticipants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

// Returns new messages from Redis since a given index
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const afterIndex = parseInt(req.nextUrl.searchParams.get("after") || "0", 10);

  const part = await db.query.conversationParticipants.findFirst({
    where: and(
      eq(conversationParticipants.conversationId, id),
      eq(conversationParticipants.userId, session.user.id)
    ),
  });
  if (!part) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const channelKey = `chat:${id}:msgs`;
  const currentLen = await redis.llen(channelKey);

  if (currentLen > afterIndex) {
    const rawMsgs = await redis.lrange(channelKey, afterIndex, currentLen - 1);
    const msgs = rawMsgs.map((m) => (typeof m === "string" ? JSON.parse(m) : m));
    return NextResponse.json({ messages: msgs, index: currentLen });
  }

  return NextResponse.json({ messages: [], index: currentLen });
}
