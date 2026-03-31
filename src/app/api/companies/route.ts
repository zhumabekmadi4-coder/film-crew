import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/index";
import { companies, companyServices, users } from "@/db/schema";
import { eq, ilike, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const city = searchParams.get("city");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  const conditions: any[] = [eq(companies.status, "approved")];
  if (q) conditions.push(ilike(companies.name, `%${q}%`));
  if (city) conditions.push(ilike(companies.city, `%${city}%`));

  const result = await db
    .select({
      id: companies.id,
      name: companies.name,
      description: companies.description,
      city: companies.city,
      logoUrl: companies.logoUrl,
      ownerId: companies.ownerId,
    })
    .from(companies)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const body = await req.json();
  const { name, description, city, logoUrl, website, phone, email, telegram, whatsapp } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
  }

  const [company] = await db
    .insert(companies)
    .values({
      ownerId: session.user.id,
      name: name.trim(),
      description: description?.trim() || null,
      city: city?.trim() || null,
      logoUrl: logoUrl || null,
      website: website?.trim() || null,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      telegram: telegram?.trim() || null,
      whatsapp: whatsapp?.trim() || null,
      status: "pending",
    })
    .returning();

  return NextResponse.json(company, { status: 201 });
}
