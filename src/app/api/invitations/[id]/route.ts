import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { invitations, projectMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const inv = await db.query.invitations.findFirst({
    where: and(
      eq(invitations.id, Number(id)),
      eq(invitations.toUserId, session.user.id)
    ),
  });
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db
    .update(invitations)
    .set({ status })
    .where(eq(invitations.id, Number(id)));

  if (status === "accepted") {
    await db
      .insert(projectMembers)
      .values({
        projectId: inv.projectId,
        userId: session.user.id,
        roleId: inv.roleId || null,
      })
      .onConflictDoNothing();
  }

  return NextResponse.json({ success: true });
}
