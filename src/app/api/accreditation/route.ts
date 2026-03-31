import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/index";
import { accreditationRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { type, companyId, message } = await req.json();

  if (!type || !["company", "casting-agency"].includes(type)) {
    return NextResponse.json({ error: "Неверный тип аккредитации" }, { status: 400 });
  }

  // Check for existing pending request
  const existing = await db.query.accreditationRequests.findFirst({
    where: and(
      eq(accreditationRequests.userId, session.user.id),
      eq(accreditationRequests.type, type),
      eq(accreditationRequests.status, "pending")
    ),
  });

  if (existing) {
    return NextResponse.json(
      { error: "У вас уже есть активный запрос на аккредитацию" },
      { status: 400 }
    );
  }

  const [request] = await db
    .insert(accreditationRequests)
    .values({
      userId: session.user.id,
      type,
      companyId: companyId || null,
      message: message?.trim() || null,
    })
    .returning();

  return NextResponse.json(request, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const requests = await db
    .select()
    .from(accreditationRequests)
    .where(eq(accreditationRequests.userId, session.user.id));

  return NextResponse.json(requests);
}
