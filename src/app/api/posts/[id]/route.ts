import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/index";
import { posts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { id } = await params;

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });

  if (!post) {
    return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
  }

  // Author or admin can delete
  const isAdmin = session.user.role === "admin" || session.user.role === "superadmin" || session.user.role === "content-manager";
  if (post.userId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  await db.delete(posts).where(eq(posts.id, id));
  return NextResponse.json({ success: true });
}
