import client from '@/api/client';
import type { ApiUser } from '@/types';

/**
 * L'API s'authentifie au numéro de téléphone, sans mot de passe (MVP) :
 * POST /api/auth/session, et non le POST /api/auth/login décrit dans la spec.
 * Voir src/routes/auth.ts de start-and-shift-api.
 */
export interface SessionResponse {
  token: string;
  user: ApiUser;
}

/** Numéro togolais : +228 suivi de 8 chiffres — même contrôle que l'API. */
export const PHONE_RE = /^\+228\d{8}$/;

/**
 * Ouvre une session. On n'envoie que le numéro : sans firstName/pseudo, l'API
 * refuse de créer un compte inconnu (`missing_firstName`), ce qui est le
 * comportement voulu pour un backoffice — on ne s'y inscrit pas, on y est invité.
 */
export async function login(phone: string): Promise<SessionResponse> {
  const { data } = await client.post<SessionResponse>('/api/auth/session', { phone });
  return data;
}

/** Supprime la session côté serveur : le JWT devient inutilisable. */
export async function logout(): Promise<void> {
  await client.delete('/api/auth/session');
}

/**
 * Révoque un token qu'on n'a pas conservé — cas d'un compte à qui le
 * backoffice ferme la porte : la session ne doit pas rester ouverte côté API.
 */
export async function revokeSession(token: string): Promise<void> {
  await client.delete('/api/auth/session', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Utilisateur courant. Renvoie 401 si le token est expiré ou révoqué. */
export async function me(): Promise<ApiUser> {
  const { data } = await client.get<{ user: ApiUser }>('/api/me');
  return data.user;
}
