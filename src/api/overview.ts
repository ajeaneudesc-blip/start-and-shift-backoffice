import client from '@/api/client';
import type { ModuleKey } from '@/types';

/** Sens de variation d'un KPI — pilote la couleur du delta. */
export type Trend = 'up' | 'down' | 'neutral';

/**
 * L'API met déjà en forme les chiffres (`display`, `delta`) : les séparateurs
 * de milliers et le « M F » des revenus viennent de `services/format.ts`,
 * qu'on ne réimplémente pas ici. `value` reste brut, pour les tris éventuels.
 */
export interface Kpi {
  key: string;
  label: string;
  value: number;
  display: string;
  delta: string;
  trend: Trend;
}

export interface ActivityItem {
  id: number;
  /** « @pseudo · description de l'action ». */
  text: string;
  /** Déjà formaté « 06/08 · 09:41 ». */
  time: string;
  /** Champ `action` du journal : « Rôle », « Commande », « Compte »… */
  kind: string;
}

/** Compteurs des badges de la nav — renvoyés par la même route, sans appel de plus. */
export type OverviewCounts = Partial<Record<ModuleKey, number>>;

export interface Overview {
  kpis: Kpi[];
  activity: ActivityItem[];
  counts: OverviewCounts;
}

export async function fetchOverview(): Promise<Overview> {
  const { data } = await client.get<Overview>('/api/overview');
  return data;
}
