import { relations } from "drizzle-orm";
import {
  users,
  userProfessions,
  professions,
  userPhotos,
  userEquipment,
  actorProfiles,
  companies,
  companyManagers,
  companyServices,
  posts,
  postLikes,
  postComments,
  follows,
  projects,
  projectRoles,
  projectEquipment,
  projectMembers,
  invitations,
  applications,
  conversations,
  conversationParticipants,
  messages,
  accreditationRequests,
  supportTickets,
} from "./schema";

export const usersRelations = relations(users, ({ many, one }) => ({
  professions: many(userProfessions),
  photos: many(userPhotos),
  equipment: many(userEquipment),
  actorProfile: one(actorProfiles, {
    fields: [users.id],
    references: [actorProfiles.userId],
  }),
  ownedCompanies: many(companies),
  posts: many(posts),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  ownedProjects: many(projects),
}));

export const professionsRelations = relations(professions, ({ many }) => ({
  users: many(userProfessions),
}));

export const userProfessionsRelations = relations(userProfessions, ({ one }) => ({
  user: one(users, { fields: [userProfessions.userId], references: [users.id] }),
  profession: one(professions, { fields: [userProfessions.professionId], references: [professions.id] }),
}));

export const actorProfilesRelations = relations(actorProfiles, ({ one }) => ({
  user: one(users, { fields: [actorProfiles.userId], references: [users.id] }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(users, { fields: [companies.ownerId], references: [users.id] }),
  managers: many(companyManagers),
  services: many(companyServices),
}));

export const companyManagersRelations = relations(companyManagers, ({ one }) => ({
  company: one(companies, { fields: [companyManagers.companyId], references: [companies.id] }),
  user: one(users, { fields: [companyManagers.userId], references: [users.id] }),
}));

export const companyServicesRelations = relations(companyServices, ({ one }) => ({
  company: one(companies, { fields: [companyServices.companyId], references: [companies.id] }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  likes: many(postLikes),
  comments: many(postComments),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
  user: one(users, { fields: [postLikes.userId], references: [users.id] }),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(posts, { fields: [postComments.postId], references: [posts.id] }),
  user: one(users, { fields: [postComments.userId], references: [users.id] }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id], relationName: "follower" }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: "following" }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
  roles: many(projectRoles),
  equipment: many(projectEquipment),
  members: many(projectMembers),
  invitations: many(invitations),
  applications: many(applications),
}));

export const projectRolesRelations = relations(projectRoles, ({ one }) => ({
  project: one(projects, { fields: [projectRoles.projectId], references: [projects.id] }),
  profession: one(professions, { fields: [projectRoles.professionId], references: [professions.id] }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, { fields: [conversationParticipants.conversationId], references: [conversations.id] }),
  user: one(users, { fields: [conversationParticipants.userId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const accreditationRequestsRelations = relations(accreditationRequests, ({ one }) => ({
  user: one(users, { fields: [accreditationRequests.userId], references: [users.id] }),
  company: one(companies, { fields: [accreditationRequests.companyId], references: [companies.id] }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, { fields: [supportTickets.userId], references: [users.id] }),
}));
