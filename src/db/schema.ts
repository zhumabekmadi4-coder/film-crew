import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  serial,
  unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  city: text("city"),
  experienceYears: integer("experience_years"),
  experienceDescription: text("experience_description"),
  availability: text("availability")
    .$type<"full-time" | "part-time" | "project-based">()
    .default("project-based")
    .notNull(),
  availabilityDetails: text("availability_details"),
  showreel: text("showreel"),
  website: text("website"),
  telegram: text("telegram"),
  instagram: text("instagram"),
  vk: text("vk"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const professions = pgTable("professions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const userProfessions = pgTable(
  "user_professions",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    professionId: integer("profession_id")
      .notNull()
      .references(() => professions.id),
    isPrimary: boolean("is_primary").notNull().default(true),
  },
  (t) => [unique().on(t.userId, t.professionId)]
);

export const userEquipment = pgTable("user_equipment", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  name: text("name").notNull(),
  description: text("description"),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  genre: text("genre"),
  status: text("status")
    .$type<"drafting" | "recruiting" | "in-progress" | "completed">()
    .default("drafting")
    .notNull(),
  city: text("city"),
  inviteCode: text("invite_code").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectRoles = pgTable("project_roles", {
  id: serial("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  professionId: integer("profession_id").references(() => professions.id),
  customTitle: text("custom_title"),
  description: text("description"),
  conditionsType: text("conditions_type")
    .$type<"discuss" | "specified">()
    .default("discuss")
    .notNull(),
  payment: text("payment"),
  schedule: text("schedule"),
  timeCommitment: text("time_commitment"),
  otherConditions: text("other_conditions"),
  isFilled: boolean("is_filled").default(false).notNull(),
  filledByUserId: uuid("filled_by_user_id").references(() => users.id),
});

export const projectEquipment = pgTable("project_equipment", {
  id: serial("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  name: text("name").notNull(),
  description: text("description"),
});

export const projectMembers = pgTable(
  "project_members",
  {
    id: serial("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    roleId: integer("role_id").references(() => projectRoles.id),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.projectId, t.userId)]
);

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  roleId: integer("role_id").references(() => projectRoles.id),
  fromUserId: uuid("from_user_id")
    .notNull()
    .references(() => users.id),
  toUserId: uuid("to_user_id")
    .notNull()
    .references(() => users.id),
  status: text("status")
    .$type<"pending" | "accepted" | "declined">()
    .default("pending")
    .notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  roleId: integer("role_id").references(() => projectRoles.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  status: text("status")
    .$type<"pending" | "accepted" | "declined">()
    .default("pending")
    .notNull(),
  coverMessage: text("cover_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").$type<"direct" | "project">().notNull(),
  projectId: uuid("project_id").references(() => projects.id),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: serial("id").primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    lastReadAt: timestamp("last_read_at"),
  },
  (t) => [unique().on(t.conversationId, t.userId)]
);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
