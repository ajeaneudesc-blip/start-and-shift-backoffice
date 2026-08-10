import client from '@/api/client';
import type { OrderState } from '@/types';

export interface OrderRow {
  /** Référence « CMD-4821 » : c'est la clé de l'API, pas l'id numérique. */
  ref: string;
  client: string;
  handle: string;
  pack: string;
  amountFCFA: number;
  /** Déjà formaté : « 85 000 F ». */
  amount: string;
  state: OrderState;
  /** Seul état vers lequel l'API accepte d'avancer ; `null` sur ARCHIVE. */
  nextState: OrderState | null;
  createdAt: string;
}

export async function listOrders(status: OrderState | 'all' = 'all'): Promise<OrderRow[]> {
  const { data } = await client.get<{ items: OrderRow[] }>('/api/orders', {
    params: { status },
  });
  return data.items;
}

/** Avance d'un cran. Un autre état renvoie 409 `invalid_transition`. */
export async function advanceOrder(ref: string, state: OrderState): Promise<OrderRow> {
  const { data } = await client.patch<OrderRow>(`/api/orders/${encodeURIComponent(ref)}`, { state });
  return data;
}
