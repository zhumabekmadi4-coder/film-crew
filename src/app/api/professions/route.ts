import { NextResponse } from "next/server";
import { db } from "@/db";
import { professions } from "@/db/schema";

export async function GET() {
  const all = await db.select().from(professions).orderBy(professions.name);
  return NextResponse.json(all);
}
