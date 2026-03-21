import { db } from "../index";
import {
  conversations,
  conversationParticipants,
  messages,
  users,
} from "../schema";
import { eq, and, desc, gt } from "drizzle-orm";

export async function getUserConversations(userId: string) {
  const participations = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId));

  if (participations.length === 0) return [];

  const convIds = participations.map((p) => p.conversationId);

  const result = [];
  for (const convId of convIds) {
    const conv = await db.query.conversations.findFirst({
      where: eq(conversations.id, convId),
    });
    if (!conv) continue;

    const participants = await db
      .select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      })
      .from(conversationParticipants)
      .leftJoin(users, eq(conversationParticipants.userId, users.id))
      .where(eq(conversationParticipants.conversationId, convId));

    const lastMsg = await db.query.messages.findFirst({
      where: eq(messages.conversationId, convId),
      orderBy: (m, { desc }) => [desc(m.createdAt)],
    });

    result.push({ ...conv, participants, lastMessage: lastMsg });
  }

  return result;
}

export async function getMessages(conversationId: string, after?: string) {
  const msgs = after
    ? await db
        .select({
          id: messages.id,
          conversationId: messages.conversationId,
          senderId: messages.senderId,
          content: messages.content,
          createdAt: messages.createdAt,
          senderName: users.name,
          senderAvatar: users.avatarUrl,
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(
          and(
            eq(messages.conversationId, conversationId),
            gt(messages.createdAt, new Date(after))
          )
        )
        .orderBy(messages.createdAt)
    : await db
        .select({
          id: messages.id,
          conversationId: messages.conversationId,
          senderId: messages.senderId,
          content: messages.content,
          createdAt: messages.createdAt,
          senderName: users.name,
          senderAvatar: users.avatarUrl,
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt)
        .limit(50);

  return msgs;
}

export async function getOrCreateDM(userId1: string, userId2: string) {
  // Check if DM already exists
  const existing = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId1));

  for (const { conversationId } of existing) {
    const conv = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });
    if (conv?.type !== "direct") continue;

    const other = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId2)
      ),
    });
    if (other) return conv;
  }

  // Create new DM
  const [conv] = await db
    .insert(conversations)
    .values({ type: "direct" })
    .returning();

  await db.insert(conversationParticipants).values([
    { conversationId: conv.id, userId: userId1 },
    { conversationId: conv.id, userId: userId2 },
  ]);

  return conv;
}
