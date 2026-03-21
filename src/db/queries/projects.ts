import { db } from "../index";
import {
  projects,
  projectRoles,
  projectEquipment,
  projectMembers,
  users,
  professions,
} from "../schema";
import { eq, and, ilike, desc, count } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getProjectById(id: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });
  if (!project) return null;

  const roles = await db
    .select({
      id: projectRoles.id,
      projectId: projectRoles.projectId,
      professionId: projectRoles.professionId,
      customTitle: projectRoles.customTitle,
      description: projectRoles.description,
      conditionsType: projectRoles.conditionsType,
      payment: projectRoles.payment,
      schedule: projectRoles.schedule,
      timeCommitment: projectRoles.timeCommitment,
      otherConditions: projectRoles.otherConditions,
      isFilled: projectRoles.isFilled,
      filledByUserId: projectRoles.filledByUserId,
      professionName: professions.name,
    })
    .from(projectRoles)
    .leftJoin(professions, eq(projectRoles.professionId, professions.id))
    .where(eq(projectRoles.projectId, id));

  const equipment = await db
    .select()
    .from(projectEquipment)
    .where(eq(projectEquipment.projectId, id));

  const owner = await db.query.users.findFirst({
    where: eq(users.id, project.ownerId),
    columns: { id: true, name: true, avatarUrl: true },
  });

  const membersCount = await db
    .select({ count: count() })
    .from(projectMembers)
    .where(eq(projectMembers.projectId, id));

  return {
    ...project,
    roles,
    equipment,
    owner,
    membersCount: membersCount[0]?.count ?? 0,
  };
}

export async function searchProjects({
  status,
  genre,
  city,
  query,
  limit = 20,
  offset = 0,
}: {
  status?: string;
  genre?: string;
  city?: string;
  query?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];
  if (status) conditions.push(eq(projects.status, status as "drafting" | "recruiting" | "in-progress" | "completed"));
  else conditions.push(eq(projects.status, "recruiting"));
  if (genre) conditions.push(eq(projects.genre, genre));
  if (city) conditions.push(ilike(projects.city, `%${city}%`));
  if (query) conditions.push(ilike(projects.title, `%${query}%`));

  const result = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      genre: projects.genre,
      status: projects.status,
      city: projects.city,
      ownerId: projects.ownerId,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(and(...conditions))
    .orderBy(desc(projects.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function getUserProjects(userId: string) {
  const owned = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, userId))
    .orderBy(desc(projects.createdAt));

  const memberOf = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(eq(projectMembers.userId, userId));

  const memberProjects =
    memberOf.length > 0
      ? await db.query.projects.findMany({
          where: (p, { inArray, ne }) =>
            and(
              inArray(p.id, memberOf.map((m) => m.projectId)),
              ne(p.ownerId, userId)
            ),
          orderBy: (p, { desc }) => [desc(p.createdAt)],
        })
      : [];

  return { owned, memberOf: memberProjects };
}

export async function generateInviteCode(projectId: string) {
  const code = nanoid(10);
  await db
    .update(projects)
    .set({ inviteCode: code })
    .where(eq(projects.id, projectId));
  return code;
}
