import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  serial,
  unique,
  numeric,
  index,
} from "drizzle-orm/pg-core";

// ==================== USERS ====================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  selfieUrl: text("selfie_url"),
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
  portfolio: text("portfolio"),
  vk: text("vk"),
  whatsapp: text("whatsapp"),

  // Roles & status
  role: text("role")
    .$type<"user" | "content-manager" | "admin" | "superadmin">()
    .default("user")
    .notNull(),
  isActor: boolean("is_actor").default(false).notNull(),
  isCastingDirector: boolean("is_casting_director").default(false).notNull(),

  // Registration fields
  ageConfirmed: boolean("age_confirmed").default(false).notNull(),
  termsAccepted: boolean("terms_accepted").default(false).notNull(),
  referralCode: text("referral_code").unique(),
  referredBy: uuid("referred_by"),

  // Privacy
  privacyShowPhone: boolean("privacy_show_phone").default(false).notNull(),
  privacyShowTelegram: boolean("privacy_show_telegram").default(true).notNull(),
  privacyShowWhatsapp: boolean("privacy_show_whatsapp").default(true).notNull(),
  privacyAllowMessages: boolean("privacy_allow_messages")
    .default(true)
    .notNull(),

  // Moderation
  isBanned: boolean("is_banned").default(false).notNull(),
  isShadowBanned: boolean("is_shadow_banned").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== PROFESSIONS ====================

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

// ==================== USER PHOTOS & EQUIPMENT ====================

export const userPhotos = pgTable("user_photos", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  order: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userEquipment = pgTable("user_equipment", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  name: text("name").notNull(),
  description: text("description"),
});

// ==================== ACTOR PROFILES ====================

export const actorProfiles = pgTable("actor_profiles", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  gender: text("gender").$type<"male" | "female" | "other">(),
  birthYear: integer("birth_year"),
  height: integer("height"), // cm
  weight: integer("weight"), // kg
  hairColor: text("hair_color"),
  eyeColor: text("eye_color"),
  ethnicity: text("ethnicity"),
  languages: text("languages"), // comma-separated
  bodyType: text("body_type"),
  specialSkills: text("special_skills"),
  // Required photos (min 4)
  photoFront: text("photo_front"), // анфас
  photoProfile: text("photo_profile"), // профиль
  photo34: text("photo_34"), // 3/4
  photoFull: text("photo_full"), // полный рост
  // Additional
  voiceDemo: text("voice_demo"),
  actingShowreel: text("acting_showreel"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== COMPANIES ====================

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  city: text("city"),
  logoUrl: text("logo_url"),
  website: text("website"),
  phone: text("phone"),
  email: text("email"),
  telegram: text("telegram"),
  whatsapp: text("whatsapp"),
  status: text("status")
    .$type<"pending" | "approved" | "rejected">()
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companyManagers = pgTable(
  "company_managers",
  {
    id: serial("id").primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    canEditServices: boolean("can_edit_services").default(false).notNull(),
    canReplyMessages: boolean("can_reply_messages").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.companyId, t.userId)]
);

export const companyServices = pgTable("company_services", {
  id: serial("id").primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price"),
  category: text("category"),
  isHidden: boolean("is_hidden").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== POSTS (FEED) ====================

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isWelcomePost: boolean("is_welcome_post").default(false).notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("posts_user_id_idx").on(t.userId),
  index("posts_created_at_idx").on(t.createdAt),
]);

export const postLikes = pgTable(
  "post_likes",
  {
    id: serial("id").primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.postId, t.userId)]
);

export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  parentCommentId: integer("parent_comment_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== FOLLOWS ====================

export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.followerId, t.followingId)]
);

// ==================== PROJECTS ====================

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  genre: text("genre"),
  type: text("type")
    .$type<"technical" | "casting">()
    .default("technical")
    .notNull(),
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
  // Casting-specific fields
  roleType: text("role_type").$type<"main" | "episodic" | "mass">(),
  gender: text("gender").$type<"male" | "female" | "any">(),
  ageFrom: integer("age_from"),
  ageTo: integer("age_to"),
  heightFrom: integer("height_from"),
  heightTo: integer("height_to"),
  weightFrom: integer("weight_from"),
  weightTo: integer("weight_to"),
  appearance: text("appearance"),
  requiredLanguages: text("required_languages"),
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

// ==================== INVITATIONS & APPLICATIONS ====================

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

// ==================== CONVERSATIONS & MESSAGES ====================

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type")
    .$type<"direct" | "project" | "company" | "group">()
    .notNull(),
  projectId: uuid("project_id").references(() => projects.id),
  companyId: uuid("company_id").references(() => companies.id),
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
  asCompanyId: uuid("as_company_id").references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("messages_conversation_id_idx").on(t.conversationId),
  index("messages_created_at_idx").on(t.createdAt),
]);

// ==================== ACCREDITATION ====================

export const accreditationRequests = pgTable("accreditation_requests", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type")
    .$type<"company" | "casting-agency">()
    .notNull(),
  companyId: uuid("company_id").references(() => companies.id),
  status: text("status")
    .$type<"pending" | "approved" | "rejected">()
    .default("pending")
    .notNull(),
  message: text("message"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== SUPPORT ====================

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status")
    .$type<"open" | "in-progress" | "closed">()
    .default("open")
    .notNull(),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== APP SETTINGS ====================

export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
