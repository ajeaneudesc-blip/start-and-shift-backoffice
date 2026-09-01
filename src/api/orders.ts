import client from '@/api/client';
import type { OrderState, PaymentMethod } from '@/types';

export interface OrderRow {
  /** Référence « CMD-4821 » : c'est la clé de l'API, pas l'id numérique. */
  ref: string;
  client: string;
  handle: string;
  pack: string;
  amountFCFA: number;
  /** Déjà formaté : « 85 000 F ». */
  amount: string;
  paymentMethod: PaymentMethod;
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

/**
 * Le paiement est confirmé hors app avant cet appel : la commande démarre
 * directement à l'état PAYE. `paymentMethod` ne fait qu'enregistrer le moyen déjà utilisé.
 */
export async function createOrder(input: {
  userId: number;
  pack: string;
  amountFCFA: number;
  paymentMethod: PaymentMethod;
}): Promise<OrderRow> {
  const { data } = await client.post<OrderRow>('/api/orders', input);
  return data;
}
