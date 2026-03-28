import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { userPhotos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const MAX_PHOTOS = 3;
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { dataUrl } = body;

  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  }

  if (dataUrl.length > MAX_SIZE_BYTES * 1.37) {
    return NextResponse.json({ error: "Фото слишком большое (макс 2МБ)" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(userPhotos)
    .where(eq(userPhotos.userId, session.user.id));

  if (existing.length >= MAX_PHOTOS) {
    return NextResponse.json({ error: `Максимум ${MAX_PHOTOS} фото` }, { status: 400 });
  }

  const [photo] = await db
    .insert(userPhotos)
    .values({
      userId: session.user.id,
      url: dataUrl,
      order: existing.length,
    })
    .returning();

  return NextResponse.json(photo);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  await db
    .delete(userPhotos)
    .where(and(eq(userPhotos.id, id), eq(userPhotos.userId, session.user.id)));

  return NextResponse.json({ success: true });
}
