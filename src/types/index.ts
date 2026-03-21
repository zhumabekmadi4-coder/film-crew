export type Availability = "full-time" | "part-time" | "project-based";
export type ProjectStatus = "drafting" | "recruiting" | "in-progress" | "completed";
export type ConditionsType = "discuss" | "specified";
export type InvitationStatus = "pending" | "accepted" | "declined";
export type ConversationType = "direct" | "project";

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
  email: string;
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
  professions: UserProfession[];
  equipment: Equipment[];
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
}

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  genre: string | null;
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

export interface Message {
  id: number;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: Pick<UserProfile, "id" | "name" | "avatarUrl">;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  projectId: string | null;
  title: string | null;
  createdAt: string;
  participants: Array<Pick<UserProfile, "id" | "name" | "avatarUrl">>;
  lastMessage?: Message;
  unreadCount?: number;
}
