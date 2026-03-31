import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { users, userProfessions, posts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    email,
    phone,
    password,
    name,
    city,
    experienceYears,
    bio,
    availability,
    avatarUrl,
    selfieUrl,
    ageConfirmed,
    termsAccepted,
    primaryProfessions,
    secondaryProfessions,
  } = body;

  if (!name || !password) {
    return NextResponse.json(
      { error: "Заполните все обязательные поля" },
      { status: 400 }
    );
  }
  if (!email && !phone) {
    return NextResponse.json(
      { error: "Укажите email или телефон" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Пароль должен быть не менее 6 символов" },
      { status: 400 }
    );
  }

  // Check if email/phone taken
  if (email) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email уже используется" },
        { status: 400 }
      );
    }
  }
  if (phone) {
    const existing = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    });
    if (existing) {
      return NextResponse.json(
        { error: "Телефон уже используется" },
        { status: 400 }
      );
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const referralCode = nanoid(8);

  const [user] = await db
    .insert(users)
    .values({
      email: email || null,
      phone: phone || null,
      passwordHash,
      name,
      city: city || null,
      experienceYears: experienceYears || null,
      bio: bio || null,
      availability: availability || "project-based",
      avatarUrl: avatarUrl || null,
      selfieUrl: selfieUrl || null,
      ageConfirmed: ageConfirmed || false,
      termsAccepted: termsAccepted || false,
      referralCode,
    })
    .returning({ id: users.id, name: users.name });

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

  // Create welcome post
  await db.insert(posts).values({
    userId: user.id,
    content: `Новый пользователь: ${user.name} присоединился к Film Crew!`,
    isWelcomePost: true,
  });

  return NextResponse.json({ success: true });
}
