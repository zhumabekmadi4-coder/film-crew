import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { projectMembers, users, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const members = await db
    .select({
      id: projectMembers.id,
      userId: projectMembers.userId,
      roleId: projectMembers.roleId,
      joinedAt: projectMembers.joinedAt,
      userName: users.name,
      userAvatar: users.avatarUrl,
    })
    .from(projectMembers)
    .leftJoin(users, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, id));

  return NextResponse.json(members);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { userId } = await req.json();

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.ownerId, session.user.id)),
  });
  if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db
    .delete(projectMembers)
    .where(and(eq(projectMembers.projectId, id), eq(projectMembers.userId, userId)));

  return NextResponse.json({ success: true });
}
