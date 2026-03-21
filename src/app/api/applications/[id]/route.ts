import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { applications, projectMembers, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const app = await db.query.applications.findFirst({
    where: eq(applications.id, Number(id)),
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only project owner can accept/decline
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, app.projectId), eq(projects.ownerId, session.user.id)),
  });
  if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.update(applications).set({ status }).where(eq(applications.id, Number(id)));

  if (status === "accepted") {
    await db
      .insert(projectMembers)
      .values({
        projectId: app.projectId,
        userId: app.userId,
        roleId: app.roleId || null,
      })
      .onConflictDoNothing();
  }

  return NextResponse.json({ success: true });
}
