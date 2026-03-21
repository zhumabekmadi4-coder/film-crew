import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { conversations, conversationParticipants, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const part = await db.query.conversationParticipants.findFirst({
    where: and(
      eq(conversationParticipants.conversationId, id),
      eq(conversationParticipants.userId, session.user.id)
    ),
  });
  if (!part) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const conv = await db.query.conversations.findFirst({
    where: eq(conversations.id, id),
  });

  const participants = await db
    .select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl })
    .from(conversationParticipants)
    .leftJoin(users, eq(conversationParticipants.userId, users.id))
    .where(eq(conversationParticipants.conversationId, id));

  return NextResponse.json({ ...conv, participants });
}
