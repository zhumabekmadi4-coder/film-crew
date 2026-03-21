import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchUsers } from "@/db/queries/users";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q") || undefined;
  const professionId = searchParams.get("professionId")
    ? Number(searchParams.get("professionId"))
    : undefined;
  const city = searchParams.get("city") || undefined;
  const availability = searchParams.get("availability") || undefined;
  const limit = Number(searchParams.get("limit") || 20);
  const offset = Number(searchParams.get("offset") || 0);

  const users = await searchUsers({ query, professionId, city, availability, limit, offset });
  return NextResponse.json(users);
}
