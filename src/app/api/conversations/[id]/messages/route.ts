import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { messages, conversationParticipants, conversations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getMessages } from "@/db/queries/messages";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const after = req.nextUrl.searchParams.get("after") || undefined;

  // Verify participant
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

  // Verify participant
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

  return NextResponse.json(msg);
}
