import client from '@/api/client';

export interface AuditEntry {
  id: number;
  /** Déjà formaté : « 06/08 · 09:41 ». */
  time: string;
  createdAt: string;
  /** Pseudo de l'auteur de l'action. */
  actor: string;
  /** « Rôle », « Commande », « Compte », « Modèle », « Accès », « Facturation ». */
  action: string;
  target: string;
}

export interface AuditResponse {
  items: AuditEntry[];
  total: number;
  page: number;
  totalPages: number;
  /** Actions réellement présentes en base : alimente le filtre. */
  actions: { action: string; count: number }[];
}

/** 50 dernières entrées, ordre antichronologique (§7.7). */
export const AUDIT_LIMIT = 50;

export async function fetchAudit(action: string = 'all'): Promise<AuditResponse> {
  const { data } = await client.get<AuditResponse>('/api/audit', {
    params: { action, limit: AUDIT_LIMIT },
  });
  return data;
}
