import client from '@/api/client';
import type { UserPlan, UserRole, UserStatus } from '@/types';

/** Onglets de filtre rapide — mêmes clés que la table SEGMENTS de l'API. */
export type UserSegment = 'all' | 'actifs' | 'invites' | 'suspendus' | 'pro';

export interface UserRow {
  id: number;
  /** Raison sociale si elle existe, sinon le prénom. */
  name: string;
  handle: string;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  /** Déjà formaté : « il y a 4 min », « hier », « jamais ». */
  seen: string;
  initial: string;
}

export interface UsersResponse {
  items: UserRow[];
  total: number;
  page: number;
  totalPages: number;
  segmentCounts: Record<UserSegment, number>;
}

export interface UsersParams {
  q?: string;
  role?: UserRole | 'all';
  plan?: UserPlan | 'all';
  segment?: UserSegment;
  page?: number;
}

/** 10 lignes par page, comme le prototype (et défaut de l'API). */
export const PAGE_SIZE = 10;

export async function listUsers(params: UsersParams = {}): Promise<UsersResponse> {
  const { data } = await client.get<UsersResponse>('/api/users', {
    params: {
      segment: params.segment ?? 'all',
      role: params.role ?? 'all',
      plan: params.plan ?? 'all',
      page: params.page ?? 1,
      limit: PAGE_SIZE,
      ...(params.q?.trim() ? { q: params.q.trim() } : {}),
    },
  });
  return data;
}

/** Activation/suspension et changement de rôle passent par le même PATCH. */
export async function updateUser(
  id: number,
  patch: { status?: UserStatus; role?: UserRole },
): Promise<UserRow> {
  const { data } = await client.patch<UserRow>(`/api/users/${id}`, patch);
  return data;
}

export interface BulkResult {
  updated: number;
  /** Vrai si le compte connecté faisait partie de la sélection : l'API l'ignore. */
  skippedSelf: boolean;
}

export async function bulkUpdate(
  ids: number[],
  action: 'suspend' | 'activate',
): Promise<BulkResult> {
  const { data } = await client.post<BulkResult>('/api/users/bulk', { ids, action });
  return data;
}

/** 409 `user_has_data` si le compte a des conversations, commandes ou journaux. */
export async function deleteUser(id: number): Promise<void> {
  await client.delete(`/api/users/${id}`);
}
