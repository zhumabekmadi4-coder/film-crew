import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { invitations, projects, users, projectRoles } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const received = await db
    .select({
      id: invitations.id,
      projectId: invitations.projectId,
      roleId: invitations.roleId,
      fromUserId: invitations.fromUserId,
      status: invitations.status,
      message: invitations.message,
      createdAt: invitations.createdAt,
      projectTitle: projects.title,
      fromUserName: users.name,
      fromUserAvatar: users.avatarUrl,
    })
    .from(invitations)
    .leftJoin(projects, eq(invitations.projectId, projects.id))
    .leftJoin(users, eq(invitations.fromUserId, users.id))
    .where(eq(invitations.toUserId, session.user.id));

  const sent = await db
    .select({
      id: invitations.id,
      projectId: invitations.projectId,
      roleId: invitations.roleId,
      toUserId: invitations.toUserId,
      status: invitations.status,
      message: invitations.message,
      createdAt: invitations.createdAt,
      projectTitle: projects.title,
      toUserName: users.name,
    })
    .from(invitations)
    .leftJoin(projects, eq(invitations.projectId, projects.id))
    .leftJoin(users, eq(invitations.toUserId, users.id))
    .where(eq(invitations.fromUserId, session.user.id));

  return NextResponse.json({ received, sent });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, roleId, toUserId, message } = await req.json();

  const [inv] = await db
    .insert(invitations)
    .values({
      projectId,
      roleId: roleId || null,
      fromUserId: session.user.id,
      toUserId,
      message,
    })
    .returning();

  return NextResponse.json(inv);
}
