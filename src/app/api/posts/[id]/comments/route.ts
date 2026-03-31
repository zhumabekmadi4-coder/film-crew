import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/index";
import { postComments, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { id: postId } = await params;

  const comments = await db
    .select({
      id: postComments.id,
      postId: postComments.postId,
      userId: postComments.userId,
      parentCommentId: postComments.parentCommentId,
      content: postComments.content,
      createdAt: postComments.createdAt,
      userName: users.name,
      userAvatar: users.avatarUrl,
    })
    .from(postComments)
    .leftJoin(users, eq(postComments.userId, users.id))
    .where(eq(postComments.postId, postId))
    .orderBy(asc(postComments.createdAt));

  // Build tree structure
  const formatted = comments.map((c) => ({
    id: c.id,
    postId: c.postId,
    userId: c.userId,
    parentCommentId: c.parentCommentId,
    content: c.content,
    createdAt: c.createdAt,
    user: { id: c.userId, name: c.userName, avatarUrl: c.userAvatar },
  }));

  // Return flat list — client will build tree
  return NextResponse.json(formatted);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { id: postId } = await params;
  const { content, parentCommentId } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Комментарий не может быть пустым" }, { status: 400 });
  }

  const [comment] = await db
    .insert(postComments)
    .values({
      postId,
      userId: session.user.id,
      content: content.trim(),
      parentCommentId: parentCommentId || null,
    })
    .returning();

  return NextResponse.json(comment, { status: 201 });
}
