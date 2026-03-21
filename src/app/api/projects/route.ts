import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { searchProjects } from "@/db/queries/projects";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const result = await searchProjects({
    status: searchParams.get("status") || undefined,
    genre: searchParams.get("genre") || undefined,
    city: searchParams.get("city") || undefined,
    query: searchParams.get("q") || undefined,
    limit: Number(searchParams.get("limit") || 20),
    offset: Number(searchParams.get("offset") || 0),
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, genre, city, status } = await req.json();

  const [project] = await db
    .insert(projects)
    .values({
      ownerId: session.user.id,
      title,
      description,
      genre,
      city,
      status: status || "recruiting",
    })
    .returning();

  return NextResponse.json(project);
}
