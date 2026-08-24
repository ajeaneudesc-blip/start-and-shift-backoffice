import client from '@/api/client';
import type { ApiUser } from '@/types';

/**
 * L'API s'authentifie au numéro de téléphone, sans mot de passe, par code SMS
 * en deux temps : POST /api/auth/session/{request,verify}, et non le
 * POST /api/auth/login décrit dans la spec. Voir src/routes/auth.ts de
 * start-and-shift-api.
 */
export interface SessionResponse {
  token: string;
  user: ApiUser;
}

/** Numéro togolais : +228 suivi de 8 chiffres — même contrôle que l'API. */
export const PHONE_RE = /^\+228\d{8}$/;

/**
 * Demande un code par SMS. On n'envoie que le numéro : sans firstName/pseudo,
 * l'API refuse d'en préparer un pour un compte inconnu (`missing_firstName`),
 * ce qui est le comportement voulu pour un backoffice — on ne s'y inscrit pas,
 * on y est invité.
 */
export async function requestOtp(phone: string): Promise<{ sessionToken: string; expiresIn: number }> {
  const { data } = await client.post('/api/auth/session/request', { phone });
  return data;
}

/** Vérifie le code et ouvre la session. */
export async function verifyOtp(sessionToken: string, otp: string): Promise<SessionResponse> {
  const { data } = await client.post<SessionResponse>('/api/auth/session/verify', { sessionToken, otp });
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

/**
 * `GET /api/ws-ticket` — ticket à usage unique, valable 30 s, à passer en query
 * string du WebSocket.
 *
 * Le JWT ne part jamais dans l'URL d'un socket : elle finit dans les journaux du
 * serveur, ceux des proxys traversés et l'historique du navigateur, où un jeton
 * de sept jours resterait exploitable. Le ticket est détruit dès qu'il sert.
 *
 * Cet appel passe par CORS, contrairement à l'upgrade WebSocket : une page
 * d'une autre origine ne peut donc pas lire le ticket.
 */
export async function getWsTicket(): Promise<string> {
  const { data } = await client.get<{ ticket: string; expiresIn: number }>('/api/ws-ticket');
  return data.ticket;
}

/** Utilisateur courant. Renvoie 401 si le token est expiré ou révoqué. */
export async function me(): Promise<ApiUser> {
  const { data } = await client.get<{ user: ApiUser }>('/api/me');
  return data.user;
}
