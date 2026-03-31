import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/index";
import { companies, companyServices, companyManagers, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { id } = await params;

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, id),
  });
  if (!company) {
    return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
  }

  const services = await db
    .select()
    .from(companyServices)
    .where(eq(companyServices.companyId, id));

  const owner = await db.query.users.findFirst({
    where: eq(users.id, company.ownerId),
    columns: { id: true, name: true, avatarUrl: true },
  });

  return NextResponse.json({
    ...company,
    services: services.filter((s) => !s.isHidden),
    owner,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { id } = await params;

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, id),
  });
  if (!company) {
    return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
  }
  if (company.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  const body = await req.json();
  const [updated] = await db
    .update(companies)
    .set({
      name: body.name ?? company.name,
      description: body.description ?? company.description,
      city: body.city ?? company.city,
      logoUrl: body.logoUrl ?? company.logoUrl,
      website: body.website ?? company.website,
      phone: body.phone ?? company.phone,
      email: body.email ?? company.email,
      telegram: body.telegram ?? company.telegram,
      whatsapp: body.whatsapp ?? company.whatsapp,
      updatedAt: new Date(),
    })
    .where(eq(companies.id, id))
    .returning();

  return NextResponse.json(updated);
}
