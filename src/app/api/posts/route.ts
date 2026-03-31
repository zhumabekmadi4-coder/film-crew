import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/index";
import {
  posts,
  postLikes,
  postComments,
  users,
  userProfessions,
  professions,
  follows,
} from "@/db/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") || "all"; // all | following | my | news
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");
  const userId = session.user.id;

  let conditions: any[] = [eq(posts.isHidden, false)];

  if (tab === "my") {
    conditions.push(eq(posts.userId, userId));
  } else if (tab === "following") {
    const followingRows = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    const followingIds = followingRows.map((f) => f.followingId);
    if (followingIds.length === 0) {
      return NextResponse.json([]);
    }
    conditions.push(inArray(posts.userId, followingIds));
  }

  const result = await db
    .select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      isWelcomePost: posts.isWelcomePost,
      createdAt: posts.createdAt,
      userName: users.name,
      userAvatar: users.avatarUrl,
      likesCount: sql<number>`(SELECT count(*) FROM post_likes WHERE post_likes.post_id = ${posts.id})::int`,
      commentsCount: sql<number>`(SELECT count(*) FROM post_comments WHERE post_comments.post_id = ${posts.id})::int`,
      isLiked: sql<boolean>`EXISTS(SELECT 1 FROM post_likes WHERE post_likes.post_id = ${posts.id} AND post_likes.user_id = ${userId})`,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  // Fetch professions for each post author
  const authorIds = [...new Set(result.map((p) => p.userId))];
  const authorProfs =
    authorIds.length > 0
      ? await db
          .select({
            userId: userProfessions.userId,
            professionName: professions.name,
            isPrimary: userProfessions.isPrimary,
          })
          .from(userProfessions)
          .leftJoin(professions, eq(userProfessions.professionId, professions.id))
          .where(
            and(
              inArray(userProfessions.userId, authorIds),
              eq(userProfessions.isPrimary, true)
            )
          )
      : [];

  const profMap = new Map<string, string[]>();
  authorProfs.forEach((p) => {
    if (!profMap.has(p.userId)) profMap.set(p.userId, []);
    if (p.professionName) profMap.get(p.userId)!.push(p.professionName);
  });

  const formatted = result.map((p) => ({
    id: p.id,
    userId: p.userId,
    content: p.content,
    isWelcomePost: p.isWelcomePost,
    createdAt: p.createdAt,
    likesCount: p.likesCount,
    commentsCount: p.commentsCount,
    isLiked: p.isLiked,
    user: {
      id: p.userId,
      name: p.userName,
      avatarUrl: p.userAvatar,
      professions: profMap.get(p.userId) || [],
    },
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Пост не может быть пустым" }, { status: 400 });
  }

  const [post] = await db
    .insert(posts)
    .values({
      userId: session.user.id,
      content: content.trim(),
    })
    .returning();

  return NextResponse.json(post, { status: 201 });
}
