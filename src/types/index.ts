export type Availability = "full-time" | "part-time" | "project-based";
export type ProjectStatus = "drafting" | "recruiting" | "in-progress" | "completed";
export type ProjectType = "technical" | "casting";
export type ConditionsType = "discuss" | "specified";
export type InvitationStatus = "pending" | "accepted" | "declined";
export type ConversationType = "direct" | "project" | "company" | "group";
export type UserRole = "user" | "content-manager" | "admin" | "superadmin";
export type CompanyStatus = "pending" | "approved" | "rejected";
export type AccreditationType = "company" | "casting-agency";
export type CastingRoleType = "main" | "episodic" | "mass";
export type Gender = "male" | "female" | "other" | "any";

export interface Profession {
  id: number;
  name: string;
  slug: string;
}

export interface UserProfession {
  professionId: number;
  isPrimary: boolean;
  profession: Profession;
}

export interface Equipment {
  id: number;
  category: string;
  name: string;
  description: string | null;
}

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  phoneVerified: boolean;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  experienceYears: number | null;
  experienceDescription: string | null;
  availability: Availability;
  availabilityDetails: string | null;
  showreel: string | null;
  website: string | null;
  telegram: string | null;
  instagram: string | null;
  vk: string | null;
  whatsapp: string | null;
  role: UserRole;
  isActor: boolean;
  isCastingDirector: boolean;
  privacyShowPhone: boolean;
  privacyShowTelegram: boolean;
  privacyShowWhatsapp: boolean;
  privacyAllowMessages: boolean;
  professions: UserProfession[];
  equipment: Equipment[];
  referralCode: string | null;
}

export interface ActorProfile {
  id: number;
  userId: string;
  gender: "male" | "female" | "other" | null;
  birthYear: number | null;
  height: number | null;
  weight: number | null;
  hairColor: string | null;
  eyeColor: string | null;
  ethnicity: string | null;
  languages: string | null;
  bodyType: string | null;
  specialSkills: string | null;
  photoFront: string | null;
  photoProfile: string | null;
  photo34: string | null;
  photoFull: string | null;
  voiceDemo: string | null;
  actingShowreel: string | null;
}

export interface Company {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  city: string | null;
  logoUrl: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  telegram: string | null;
  whatsapp: string | null;
  status: CompanyStatus;
  services?: CompanyService[];
  owner?: Pick<UserProfile, "id" | "name" | "avatarUrl">;
}

export interface CompanyService {
  id: number;
  companyId: string;
  name: string;
  description: string | null;
  price: string | null;
  category: string | null;
  isHidden: boolean;
}

export interface CompanyManager {
  id: number;
  companyId: string;
  userId: string;
  canEditServices: boolean;
  canReplyMessages: boolean;
  user?: Pick<UserProfile, "id" | "name" | "avatarUrl">;
}

export interface ProjectRole {
  id: number;
  professionId: number | null;
  customTitle: string | null;
  description: string | null;
  conditionsType: ConditionsType;
  payment: string | null;
  schedule: string | null;
  timeCommitment: string | null;
  otherConditions: string | null;
  isFilled: boolean;
  filledByUserId: string | null;
  profession?: Profession;
  // Casting fields
  roleType: CastingRoleType | null;
  gender: Gender | null;
  ageFrom: number | null;
  ageTo: number | null;
  heightFrom: number | null;
  heightTo: number | null;
  weightFrom: number | null;
  weightTo: number | null;
  appearance: string | null;
  requiredLanguages: string | null;
}

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  genre: string | null;
  type: ProjectType;
  status: ProjectStatus;
  city: string | null;
  inviteCode: string | null;
  createdAt: string;
  roles: ProjectRole[];
  owner?: Pick<UserProfile, "id" | "name" | "avatarUrl">;
  membersCount?: number;
}

export interface Invitation {
  id: number;
  projectId: string;
  roleId: number | null;
  fromUserId: string;
  toUserId: string;
  status: InvitationStatus;
  message: string | null;
  createdAt: string;
  project?: Pick<Project, "id" | "title">;
  fromUser?: Pick<UserProfile, "id" | "name" | "avatarUrl">;
  role?: ProjectRole;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  isWelcomePost: boolean;
  createdAt: string;
  user?: Pick<UserProfile, "id" | "name" | "avatarUrl"> & {
    professions?: UserProfession[];
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

export interface PostComment {
  id: number;
  postId: string;
  userId: string;
  parentCommentId: number | null;
  content: string;
  createdAt: string;
  user?: Pick<UserProfile, "id" | "name" | "avatarUrl">;
  replies?: PostComment[];
}

export interface Message {
  id: number;
  conversationId: string;
  senderId: string;
  content: string;
  asCompanyId: string | null;
  createdAt: string;
  sender?: Pick<UserProfile, "id" | "name" | "avatarUrl">;
  company?: Pick<Company, "id" | "name" | "logoUrl">;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  projectId: string | null;
  companyId: string | null;
  title: string | null;
  createdAt: string;
  participants: Array<Pick<UserProfile, "id" | "name" | "avatarUrl">>;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface AccreditationRequest {
  id: number;
  userId: string;
  type: AccreditationType;
  companyId: string | null;
  status: "pending" | "approved" | "rejected";
  message: string | null;
  adminNote: string | null;
  createdAt: string;
  user?: Pick<UserProfile, "id" | "name" | "avatarUrl">;
  company?: Pick<Company, "id" | "name">;
}

export interface SupportTicket {
  id: number;
  userId: string;
  subject: string;
  message: string;
  status: "open" | "in-progress" | "closed";
  adminReply: string | null;
  createdAt: string;
}
