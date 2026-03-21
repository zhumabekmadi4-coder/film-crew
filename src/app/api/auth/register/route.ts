import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, userProfessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, name, city, experienceYears, bio, availability, primaryProfessions, secondaryProfessions } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Пароль должен быть не менее 6 символов" }, { status: 400 });
  }

  // Check if email taken
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    return NextResponse.json({ error: "Email уже используется" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      city: city || null,
      experienceYears: experienceYears || null,
      bio: bio || null,
      availability: availability || "project-based",
    })
    .returning({ id: users.id });

  // Insert professions
  const profToInsert = [
    ...(primaryProfessions || []).map((id: number) => ({
      userId: user.id,
      professionId: id,
      isPrimary: true,
    })),
    ...(secondaryProfessions || []).map((id: number) => ({
      userId: user.id,
      professionId: id,
      isPrimary: false,
    })),
  ];
  if (profToInsert.length > 0) {
    await db.insert(userProfessions).values(profToInsert);
  }

  return NextResponse.json({ success: true });
}
