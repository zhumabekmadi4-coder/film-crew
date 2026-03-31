import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/index";
import { supportTickets } from "@/db/schema";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { subject, message } = await req.json();
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
  }

  const [ticket] = await db
    .insert(supportTickets)
    .values({
      userId: session.user.id,
      subject: subject.trim(),
      message: message.trim(),
    })
    .returning();

  return NextResponse.json(ticket, { status: 201 });
}
