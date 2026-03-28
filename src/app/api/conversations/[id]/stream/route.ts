import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { conversationParticipants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  const part = await db.query.conversationParticipants.findFirst({
    where: and(
      eq(conversationParticipants.conversationId, id),
      eq(conversationParticipants.userId, session.user.id)
    ),
  });
  if (!part) return new Response("Forbidden", { status: 403 });

  const encoder = new TextEncoder();
  const channelKey = `chat:${id}:msgs`;

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(": connected\n\n"));

      let closed = false;
      let lastIndex = await redis.llen(channelKey);

      req.signal.addEventListener("abort", () => {
        closed = true;
        try { controller.close(); } catch {}
      });

      while (!closed) {
        try {
          const currentLen = await redis.llen(channelKey);

          if (currentLen > lastIndex) {
            const rawMsgs = await redis.lrange(channelKey, lastIndex, currentLen - 1);
            for (const m of rawMsgs) {
              const data = typeof m === "string" ? m : JSON.stringify(m);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            lastIndex = currentLen;
          }

          controller.enqueue(encoder.encode(": ping\n\n"));
          await new Promise((r) => setTimeout(r, 800));
        } catch {
          if (!closed) await new Promise((r) => setTimeout(r, 2000));
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
