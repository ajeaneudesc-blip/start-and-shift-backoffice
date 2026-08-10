import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { ModuleKey, PermLevel, RoleKey, UserRole } from '@/types';

/**
 * Matrice de permissions — copie exacte de `src/services/rbac.ts` côté API.
 * Elle ne sert qu'à l'affichage : l'API reste seule juge sur chaque requête.
 * 0 = module masqué · 1 = lecture seule · 2 = lecture + écriture · 3 = total
 */
export const P: Record<ModuleKey, Record<RoleKey, PermLevel>> = {
  overview:  { admin: 3, manager: 2, designer: 1, support: 1, viewer: 1 },
  conv:      { admin: 3, manager: 2, designer: 3, support: 3, viewer: 1 },
  users:     { admin: 3, manager: 2, designer: 1, support: 2, viewer: 1 },
  orders:    { admin: 3, manager: 3, designer: 2, support: 1, viewer: 1 },
  templates: { admin: 3, manager: 2, designer: 3, support: 0, viewer: 1 },
  roles:     { admin: 3, manager: 1, designer: 0, support: 0, viewer: 0 },
  audit:     { admin: 3, manager: 1, designer: 1, support: 1, viewer: 0 },
};

export const LEVEL_LABELS: Record<PermLevel, string> = {
  0: 'Aucun',
  1: 'Lecture',
  2: 'Écriture',
  3: 'Total',
};

export interface RoleMeta {
  key: RoleKey;
  label: string;
  desc: string;
}

/** Libellés du prototype (constante ROLES du Backoffice). */
export const ROLES: RoleMeta[] = [
  { key: 'admin',    label: 'Admin',    desc: 'Accès complet, gère les rôles et la facturation.' },
  { key: 'manager',  label: 'Manager',  desc: 'Pilote les commandes et les utilisateurs.' },
  { key: 'designer', label: 'Designer', desc: 'Produit les visuels, gère la bibliothèque.' },
  { key: 'support',  label: 'Support',  desc: 'Assiste les clients, consulte les commandes.' },
  { key: 'viewer',   label: 'Lecture',  desc: 'Consultation seule, aucun changement possible.' },
];

export interface ModuleMeta {
  key: ModuleKey;
  /** Libellé court affiché dans la nav latérale. */
  label: string;
  path: string;
  /** Titre et description du PageHeader. */
  title: string;
  desc: string;
  /** Libellé du bouton d'action principal (visible à partir du niveau 2). */
  action: string;
}

/** Libellés du prototype (constante MODULES du Backoffice). */
export const MODULES: ModuleMeta[] = [
  { key: 'overview',  label: "Vue d'ensemble", path: '/',              title: "Vue d'ensemble",    desc: 'Activité de la plateforme sur les 7 derniers jours.',       action: 'Exporter' },
  { key: 'conv',      label: 'Conversations',  path: '/conversations', title: 'Conversations',     desc: 'Tous les échanges clients, filtrables et attribuables.',    action: 'Nouveau message' },
  { key: 'users',     label: 'Utilisateurs',   path: '/users',         title: 'Utilisateurs',      desc: "Comptes inscrits, rôles applicatifs et statut d'accès.",    action: 'Inviter' },
  { key: 'orders',    label: 'Commandes',      path: '/orders',        title: 'Commandes',         desc: 'Packs payés, en production et livrés.',                     action: 'Nouvelle commande' },
  { key: 'templates', label: 'Modèles',        path: '/templates',     title: 'Modèles',           desc: "Bibliothèque de gabarits proposés dans l'app.",             action: 'Ajouter un modèle' },
  { key: 'roles',     label: 'Rôles & accès',  path: '/roles',         title: 'Rôles & permissions', desc: 'Qui voit quoi, qui modifie quoi. Une ligne par module.',  action: 'Créer un rôle' },
  { key: 'audit',     label: 'Journal',        path: '/audit',         title: "Journal d'activité", desc: 'Toutes les actions sensibles, horodatées.',                 action: 'Exporter' },
];

export const MODULE_BY_KEY = Object.fromEntries(
  MODULES.map((m) => [m.key, m]),
) as Record<ModuleKey, ModuleMeta>;

export const ROLE_BY_KEY = Object.fromEntries(
  ROLES.map((r) => [r.key, r]),
) as Record<RoleKey, RoleMeta>;

/**
 * Convertit le UserRole Prisma en RoleKey de la matrice.
 * CLIENT retombe sur "viewer", comme `toRoleKey` côté API.
 */
export function toRoleKey(role: UserRole | string | null | undefined): RoleKey {
  const map: Record<string, RoleKey> = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    DESIGNER: 'designer',
    SUPPORT: 'support',
    VIEWER: 'viewer',
    CLIENT: 'viewer',
  };
  return (role && map[role]) || 'viewer';
}

/** Niveau d'un rôle sur un module, hors contexte React. */
export function levelFor(module: ModuleKey, role: RoleKey): PermLevel {
  return P[module]?.[role] ?? 0;
}

/**
 * Rôle qui pilote l'affichage : celui du JWT, sauf si le sélecteur du header
 * simule un autre périmètre (dev uniquement, cf. §10 de la spec).
 */
export function useEffectiveRole(): RoleKey {
  const simulated = useAuthStore((s) => s.simulatedRole);
  const role = useAuthStore((s) => s.user?.role);
  return simulated ?? toRoleKey(role);
}

export interface Rbac {
  role: RoleKey;
  roleMeta: RoleMeta;
  /** Niveau du rôle courant sur un module. */
  lvl: (module: ModuleKey) => PermLevel;
  /** Modules de niveau >= 1 : ce que la nav doit afficher. */
  visibleModules: ModuleMeta[];
}

/** Périmètre du rôle effectif (rôle du JWT, ou rôle simulé en dev). */
export function useRbac(): Rbac {
  const role = useEffectiveRole();

  return useMemo(
    () => ({
      role,
      roleMeta: ROLE_BY_KEY[role],
      lvl: (module: ModuleKey) => levelFor(module, role),
      visibleModules: MODULES.filter((m) => levelFor(m.key, role) >= 1),
    }),
    [role],
  );
}
