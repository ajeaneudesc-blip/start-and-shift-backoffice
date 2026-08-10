/** Miroir des enums Prisma exposés par start-and-shift-api. */
export type UserRole = 'CLIENT' | 'DESIGNER' | 'MANAGER' | 'SUPPORT' | 'VIEWER' | 'ADMIN';
export type UserPlan = 'GRATUIT' | 'PRO';
export type UserStatus = 'ACTIF' | 'INVITE' | 'SUSPENDU';
export type ConvStatus = 'OUVERTE' | 'EN_ATTENTE' | 'RESOLUE';
export type MessageFrom = 'client' | 'equipe' | 'assistant';
export type OrderState = 'PAYE' | 'EN_PRODUCTION' | 'LIVRE' | 'ARCHIVE';
export type TemplateState = 'PUBLIE' | 'BROUILLON';

/** Ligne User telle que sérialisée par l'API (dates en ISO). */
export interface ApiUser {
  id: number;
  firstName: string;
  raisonSociale: string | null;
  pseudo: string;
  phone: string;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  createdAt: string;
  lastSeenAt: string | null;
}

/** Clés de rôle du backoffice — celles de la matrice de permissions. */
export type RoleKey = 'admin' | 'manager' | 'designer' | 'support' | 'viewer';

export type ModuleKey = 'overview' | 'conv' | 'users' | 'orders' | 'templates' | 'roles' | 'audit';

/** 0 = masqué · 1 = lecture · 2 = écriture · 3 = total */
export type PermLevel = 0 | 1 | 2 | 3;
