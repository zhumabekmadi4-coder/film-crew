import { db } from "../index";
import {
  users,
  userProfessions,
  userEquipment,
  professions,
} from "../schema";
import { eq, ilike, and, inArray } from "drizzle-orm";

export async function getUserById(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { passwordHash: false },
  });
  if (!user) return null;

  const profs = await db
    .select({
      professionId: userProfessions.professionId,
      isPrimary: userProfessions.isPrimary,
      profession: professions,
    })
    .from(userProfessions)
    .leftJoin(professions, eq(userProfessions.professionId, professions.id))
    .where(eq(userProfessions.userId, id));

  const equip = await db
    .select()
    .from(userEquipment)
    .where(eq(userEquipment.userId, id));

  return { ...user, professions: profs, equipment: equip };
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function searchUsers({
  query,
  professionId,
  city,
  availability,
  limit = 20,
  offset = 0,
}: {
  query?: string;
  professionId?: number;
  city?: string;
  availability?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];
  if (query) conditions.push(ilike(users.name, `%${query}%`));
  if (city) conditions.push(ilike(users.city, `%${city}%`));
  if (availability) conditions.push(eq(users.availability, availability as "full-time" | "part-time" | "project-based"));

  let userIds: string[] | undefined;

  if (professionId) {
    const profUsers = await db
      .select({ userId: userProfessions.userId })
      .from(userProfessions)
      .where(eq(userProfessions.professionId, professionId));
    userIds = profUsers.map((p) => p.userId);
    if (userIds.length === 0) return [];
    conditions.push(inArray(users.id, userIds));
  }

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
      city: users.city,
      availability: users.availability,
      experienceYears: users.experienceYears,
      bio: users.bio,
    })
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset);

  return result;
}
