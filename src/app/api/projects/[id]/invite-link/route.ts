import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateInviteCode } from "@/db/queries/projects";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.ownerId, session.user.id)),
  });
  if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const code = await generateInviteCode(id);
  const link = `${process.env.NEXTAUTH_URL}/invite/${code}`;

  return NextResponse.json({ code, link });
}
