import client from '@/api/client';
import type { ConvStatus, MessageFrom, OrderState, UserPlan } from '@/types';

/** Filtres de la liste — mêmes valeurs que le `switch` de la route. */
export type ConvFilter = 'all' | 'unread' | 'pending' | 'resolved' | 'mine';

export interface ConvListItem {
  id: number;
  /** Raison sociale si elle existe, sinon le prénom. */
  client: string;
  handle: string;
  tag: string;
  status: ConvStatus;
  assignee: string | null;
  unread: boolean;
  /** Déjà formaté par l'API : « 09:41 », « Hier » ou « 06/08 ». */
  time: string;
  plan: UserPlan;
  preview: string;
}

export interface ConvMessage {
  id: number;
  from: MessageFrom;
  text: string;
  createdAt: string;
  /** Absent des messages reçus par WebSocket : à calculer avec `formatTime`. */
  time?: string;
}

/** Instantané du diagnostic figé à l'ouverture de la conversation. */
export interface DiagContext {
  resume: string | null;
  cibles: string[] | null;
  ton: string | null;
  answers: unknown;
  capturedAt: string;
}

export interface ConvDetail extends ConvListItem {
  diagContext: DiagContext | null;
  order: { ref: string; state: OrderState; pack: string } | null;
  createdAt: string;
  messages: ConvMessage[];
}

export interface ConvListResponse {
  items: ConvListItem[];
  cursor: string | null;
  /** Conversations non lues, tous filtres confondus. */
  unreadCount: number;
}

export interface ListParams {
  filter?: ConvFilter;
  q?: string;
  limit?: number;
  before?: string;
}

export async function listConversations(params: ListParams = {}): Promise<ConvListResponse> {
  const { data } = await client.get<ConvListResponse>('/api/conversations', {
    params: {
      filter: params.filter ?? 'all',
      ...(params.q?.trim() ? { q: params.q.trim() } : {}),
      ...(params.limit ? { limit: params.limit } : {}),
      ...(params.before ? { before: params.before } : {}),
    },
  });
  return data;
}

export async function getConversation(id: number): Promise<ConvDetail> {
  const { data } = await client.get<ConvDetail>(`/api/conversations/${id}`);
  return data;
}

/**
 * Réponse de l'équipe. `from: "equipe"` est le seul mode d'écriture du
 * backoffice — `"assistant"` déclencherait une génération au nom du client.
 */
export async function sendMessage(id: number, text: string): Promise<ConvMessage> {
  const { data } = await client.post<{ msg: ConvMessage }>(`/api/conversations/${id}/messages`, {
    text,
    from: 'equipe',
  });
  return data.msg;
}

/**
 * Statut et assignation passent par le même PATCH — l'API n'expose ni
 * `/assign` ni `/status` comme le supposait la spec.
 */
export interface ConvPatch {
  status?: ConvStatus;
  /** Pseudo d'un membre de l'équipe, ou `null` pour retirer l'assignation. */
  assignee?: string | null;
}

export async function patchConversation(id: number, patch: ConvPatch): Promise<ConvListItem> {
  const { data } = await client.patch<ConvListItem>(`/api/conversations/${id}`, patch);
  return data;
}
