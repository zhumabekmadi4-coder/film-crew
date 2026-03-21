import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { projectRoles, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const roles = await db
    .select()
    .from(projectRoles)
    .where(eq(projectRoles.projectId, id));

  return NextResponse.json(roles);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify ownership
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.ownerId, session.user.id)),
  });
  if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const [role] = await db
    .insert(projectRoles)
    .values({
      projectId: id,
      professionId: body.professionId || null,
      customTitle: body.customTitle || null,
      description: body.description || null,
      conditionsType: body.conditionsType || "discuss",
      payment: body.payment || null,
      schedule: body.schedule || null,
      timeCommitment: body.timeCommitment || null,
      otherConditions: body.otherConditions || null,
    })
    .returning();

  return NextResponse.json(role);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { roleId, ...updates } = body;

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.ownerId, session.user.id)),
  });
  if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.update(projectRoles).set(updates).where(eq(projectRoles.id, roleId));
  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { roleId } = await req.json();

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.ownerId, session.user.id)),
  });
  if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(projectRoles).where(eq(projectRoles.id, roleId));
  return NextResponse.json({ success: true });
}
