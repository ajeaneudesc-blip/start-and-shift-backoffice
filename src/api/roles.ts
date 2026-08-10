import client from '@/api/client';
import type { ModuleKey, PermLevel, RoleKey } from '@/types';

/**
 * Matrice effective : les valeurs par défaut de `services/rbac.ts` côté API,
 * surchargées par la table RolePermission. Elle peut donc différer du `P`
 * codé dans useRbac — c'est celle-ci qui fait foi à l'écran.
 */
export interface RolesMatrix {
  roles: { key: RoleKey; label: string; desc: string }[];
  modules: { key: ModuleKey; label: string }[];
  levels: Record<PermLevel, string>;
  matrix: Record<ModuleKey, Record<RoleKey, PermLevel>>;
}

export async function fetchRoles(): Promise<RolesMatrix> {
  const { data } = await client.get<RolesMatrix>('/api/roles');
  return data;
}
