import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export type RoleLevel = "user" | "content-manager" | "admin" | "superadmin";

const ROLE_HIERARCHY: Record<RoleLevel, number> = {
  user: 0,
  "content-manager": 1,
  admin: 2,
  superadmin: 3,
};

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Не авторизован" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

export async function requireRole(minRole: RoleLevel) {
  const { error, session } = await requireAuth();
  if (error) return { error, session: null };

  const userRole = (session!.user.role || "user") as RoleLevel;
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[minRole]) {
    return {
      error: NextResponse.json({ error: "Недостаточно прав" }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session: session! };
}

export function hasRole(userRole: string, minRole: RoleLevel): boolean {
  return ROLE_HIERARCHY[userRole as RoleLevel] >= ROLE_HIERARCHY[minRole];
}
