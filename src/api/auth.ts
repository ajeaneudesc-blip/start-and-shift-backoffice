import client from '@/api/client';
import type { ApiUser } from '@/types';

/**
 * Le backoffice se connecte au pseudo et au mot de passe
 * (POST /api/auth/login). Le numéro et le code SMS restent la porte de l'app
 * cliente : ici, rien ne dépend plus de la couverture réseau ni du crédit SMS
 * pour que l'équipe travaille.
 */
export interface SessionResponse {
  token: string;
  user: ApiUser;
}

/**
 * `POST /api/auth/login` — pseudo et mot de passe. L'API répond 401
 * `invalid_credentials` sans distinguer un pseudo inconnu, un compte client et
 * un mot de passe faux : les pseudos de l'équipe sont visibles des clients
 * dans les conversations, les énumérer ne doit rien apprendre.
 */
export async function login(pseudo: string, password: string): Promise<SessionResponse> {
  const { data } = await client.post<SessionResponse>('/api/auth/login', { pseudo, password });
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
