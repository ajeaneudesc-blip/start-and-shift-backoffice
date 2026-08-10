import type { Tone } from '@/theme/tones';
import type {
  ConvStatus,
  OrderState,
  TemplateState,
  UserPlan,
  UserRole,
  UserStatus,
} from '@/types';

/**
 * Libellés français des enums de l'API et couleur de leur pastille.
 * Les tons reprennent la table `pill()` du prototype.
 */

export const CONV_STATUS_LABELS: Record<ConvStatus, string> = {
  OUVERTE: 'Ouverte',
  EN_ATTENTE: 'En attente',
  RESOLUE: 'Résolue',
};

export const CONV_STATUS_TONES: Record<ConvStatus, Tone> = {
  OUVERTE: 'info',
  EN_ATTENTE: 'warn',
  RESOLUE: 'ok',
};

export const ORDER_STATE_LABELS: Record<OrderState, string> = {
  PAYE: 'Payé',
  EN_PRODUCTION: 'En production',
  LIVRE: 'Livré',
  ARCHIVE: 'Archivé',
};

export const ORDER_STATE_TONES: Record<OrderState, Tone> = {
  PAYE: 'info',
  EN_PRODUCTION: 'warn',
  LIVRE: 'ok',
  ARCHIVE: 'muted',
};

export const TEMPLATE_STATE_LABELS: Record<TemplateState, string> = {
  PUBLIE: 'Publié',
  BROUILLON: 'Brouillon',
};

export const PLAN_LABELS: Record<UserPlan, string> = {
  GRATUIT: 'Gratuit',
  PRO: 'Pro',
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIF: 'Actif',
  INVITE: 'Invité',
  SUSPENDU: 'Suspendu',
};

export const USER_STATUS_TONES: Record<UserStatus, Tone> = {
  ACTIF: 'ok',
  INVITE: 'warn',
  SUSPENDU: 'danger',
};

/** « Lecture » plutôt que « Viewer » : libellé du prototype. */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  CLIENT: 'Client',
  DESIGNER: 'Designer',
  MANAGER: 'Manager',
  SUPPORT: 'Support',
  VIEWER: 'Lecture',
  ADMIN: 'Admin',
};
