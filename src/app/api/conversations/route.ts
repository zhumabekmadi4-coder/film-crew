import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserConversations, getOrCreateDM } from "@/db/queries/messages";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const convs = await getUserConversations(session.user.id);
  return NextResponse.json(convs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await req.json();
  const conv = await getOrCreateDM(session.user.id, userId);
  return NextResponse.json(conv);
}
