import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/index";
import { actorProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || session.user.id;

  const profile = await db.query.actorProfiles.findFirst({
    where: eq(actorProfiles.userId, userId),
  });

  return NextResponse.json(profile || null);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const body = await req.json();
  const userId = session.user.id;

  const existing = await db.query.actorProfiles.findFirst({
    where: eq(actorProfiles.userId, userId),
  });

  const data = {
    userId,
    gender: body.gender || null,
    birthYear: body.birthYear || null,
    height: body.height || null,
    weight: body.weight || null,
    hairColor: body.hairColor || null,
    eyeColor: body.eyeColor || null,
    ethnicity: body.ethnicity || null,
    languages: body.languages || null,
    bodyType: body.bodyType || null,
    specialSkills: body.specialSkills || null,
    photoFront: body.photoFront || null,
    photoProfile: body.photoProfile || null,
    photo34: body.photo34 || null,
    photoFull: body.photoFull || null,
    voiceDemo: body.voiceDemo || null,
    actingShowreel: body.actingShowreel || null,
    updatedAt: new Date(),
  };

  if (existing) {
    const [updated] = await db
      .update(actorProfiles)
      .set(data)
      .where(eq(actorProfiles.userId, userId))
      .returning();

    // Mark user as actor
    await db.update(users).set({ isActor: true }).where(eq(users.id, userId));

    return NextResponse.json(updated);
  } else {
    const [created] = await db
      .insert(actorProfiles)
      .values(data)
      .returning();

    await db.update(users).set({ isActor: true }).where(eq(users.id, userId));

    return NextResponse.json(created, { status: 201 });
  }
}
