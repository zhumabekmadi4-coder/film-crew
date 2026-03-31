import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/index";
import { companies, companyServices, companyManagers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function canEditServices(userId: string, companyId: string) {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
  });
  if (company?.ownerId === userId) return true;

  const manager = await db.query.companyManagers.findFirst({
    where: and(
      eq(companyManagers.companyId, companyId),
      eq(companyManagers.userId, userId),
      eq(companyManagers.canEditServices, true)
    ),
  });
  return !!manager;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { id: companyId } = await params;

  if (!(await canEditServices(session.user.id, companyId))) {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  const { name, description, price, category } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Название услуги обязательно" }, { status: 400 });
  }

  const [service] = await db
    .insert(companyServices)
    .values({
      companyId,
      name: name.trim(),
      description: description?.trim() || null,
      price: price?.trim() || null,
      category: category || null,
    })
    .returning();

  return NextResponse.json(service, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { id: companyId } = await params;
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");

  if (!serviceId) {
    return NextResponse.json({ error: "serviceId обязателен" }, { status: 400 });
  }

  if (!(await canEditServices(session.user.id, companyId))) {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  await db.delete(companyServices).where(eq(companyServices.id, parseInt(serviceId)));
  return NextResponse.json({ success: true });
}
