import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { applications, projects, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mine = await db
    .select({
      id: applications.id,
      projectId: applications.projectId,
      roleId: applications.roleId,
      status: applications.status,
      coverMessage: applications.coverMessage,
      createdAt: applications.createdAt,
      projectTitle: projects.title,
    })
    .from(applications)
    .leftJoin(projects, eq(applications.projectId, projects.id))
    .where(eq(applications.userId, session.user.id));

  return NextResponse.json(mine);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, roleId, coverMessage } = await req.json();

  const [app] = await db
    .insert(applications)
    .values({
      projectId,
      roleId: roleId || null,
      userId: session.user.id,
      coverMessage,
    })
    .returning();

  return NextResponse.json(app);
}
