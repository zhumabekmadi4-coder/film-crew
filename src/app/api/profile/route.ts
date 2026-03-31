import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserById } from "@/db/queries/users";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserById(session.user.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = [
    "name", "bio", "city", "experienceYears", "experienceDescription",
    "availability", "availabilityDetails", "showreel", "website",
    "telegram", "instagram", "portfolio", "vk", "avatarUrl", "whatsapp",
    "privacyShowPhone", "privacyShowTelegram", "privacyShowWhatsapp", "privacyAllowMessages",
  ];

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  await db.update(users).set(updates).where(eq(users.id, session.user.id));
  return NextResponse.json({ success: true });
}
