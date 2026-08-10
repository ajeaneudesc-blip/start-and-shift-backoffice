import { useQuery } from '@tanstack/react-query';
import { fetchOverview } from '@/api/overview';

export const OVERVIEW_KEY = ['overview'] as const;

/**
 * GET /api/overview. La Sidebar et OverviewPage partagent cette clé : les
 * badges de la nav et les KPI viennent donc d'un seul appel, quelle que soit
 * la page ouverte. Tous les rôles ont au moins la lecture sur ce module.
 */
export function useOverview() {
  return useQuery({
    queryKey: OVERVIEW_KEY,
    queryFn: fetchOverview,
    // Les compteurs de la nav n'ont pas besoin d'être à la seconde près.
    staleTime: 60_000,
  });
}
