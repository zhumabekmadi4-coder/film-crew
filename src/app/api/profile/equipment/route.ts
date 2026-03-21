import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { userEquipment } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await db
    .select()
    .from(userEquipment)
    .where(eq(userEquipment.userId, session.user.id));

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { category, name, description } = await req.json();
  const [item] = await db
    .insert(userEquipment)
    .values({ userId: session.user.id, category, name, description })
    .returning();

  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await db
    .delete(userEquipment)
    .where(and(eq(userEquipment.id, id), eq(userEquipment.userId, session.user.id)));

  return NextResponse.json({ success: true });
}
