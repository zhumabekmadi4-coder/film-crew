import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware";
import { db } from "@/db/index";
import { users, accreditationRequests, companies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { error, session } = await requireRole("content-manager");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "accreditation") {
    const requests = await db
      .select({
        id: accreditationRequests.id,
        type: accreditationRequests.type,
        status: accreditationRequests.status,
        message: accreditationRequests.message,
        createdAt: accreditationRequests.createdAt,
        userId: accreditationRequests.userId,
        companyId: accreditationRequests.companyId,
      })
      .from(accreditationRequests)
      .orderBy(desc(accreditationRequests.createdAt))
      .limit(50);

    // Enrich with user data
    const enriched = await Promise.all(
      requests.map(async (req) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, req.userId),
          columns: { id: true, name: true, avatarUrl: true },
        });
        let company = null;
        if (req.companyId) {
          company = await db.query.companies.findFirst({
            where: eq(companies.id, req.companyId),
            columns: { id: true, name: true },
          });
        }
        return { ...req, user, company };
      })
    );

    return NextResponse.json(enriched);
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "shadowBan") {
    const { error, session } = await requireRole("content-manager");
    if (error) return error;

    await db
      .update(users)
      .set({ isShadowBanned: true })
      .where(eq(users.id, body.userId));
    return NextResponse.json({ success: true });
  }

  if (action === "ban" || action === "unban") {
    const { error, session } = await requireRole("superadmin");
    if (error) return error;

    await db
      .update(users)
      .set({ isBanned: action === "ban" })
      .where(eq(users.id, body.userId));
    return NextResponse.json({ success: true });
  }

  if (action === "setRole") {
    const { error, session } = await requireRole("superadmin");
    if (error) return error;

    const validRoles = ["user", "content-manager", "admin", "superadmin"];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: "Неверная роль" }, { status: 400 });
    }

    await db
      .update(users)
      .set({ role: body.role })
      .where(eq(users.id, body.userId));
    return NextResponse.json({ success: true });
  }

  if (action === "accreditation") {
    const { error, session } = await requireRole("admin");
    if (error) return error;

    const request = await db.query.accreditationRequests.findFirst({
      where: eq(accreditationRequests.id, body.requestId),
    });
    if (!request) {
      return NextResponse.json({ error: "Запрос не найден" }, { status: 404 });
    }

    await db
      .update(accreditationRequests)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(accreditationRequests.id, body.requestId));

    // If approved, update user/company status
    if (body.status === "approved") {
      if (request.type === "company" && request.companyId) {
        await db
          .update(companies)
          .set({ status: "approved" })
          .where(eq(companies.id, request.companyId));
      }
      if (request.type === "casting-agency") {
        await db
          .update(users)
          .set({ isCastingDirector: true })
          .where(eq(users.id, request.userId));
      }
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
