import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { userProfessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { primary, secondary } = await req.json();
  // primary: number[], secondary: number[]

  await db.delete(userProfessions).where(eq(userProfessions.userId, session.user.id));

  const toInsert = [
    ...(primary || []).map((id: number) => ({
      userId: session.user.id,
      professionId: id,
      isPrimary: true,
    })),
    ...(secondary || []).map((id: number) => ({
      userId: session.user.id,
      professionId: id,
      isPrimary: false,
    })),
  ];

  if (toInsert.length > 0) {
    await db.insert(userProfessions).values(toInsert);
  }

  return NextResponse.json({ success: true });
}
