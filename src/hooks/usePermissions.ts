import { useMemo } from 'react';
import { useRbac } from '@/hooks/useRbac';
import type { ModuleKey, PermLevel } from '@/types';

export interface Permissions {
  level: PermLevel;
  /** Le module est visible. */
  canRead: boolean;
  /** Les actions d'écriture sont autorisées. */
  canWrite: boolean;
  /** Les actions de suppression sont autorisées. */
  canDelete: boolean;
  /** Niveau 1 exactement : bannière « Lecture seule » à afficher. */
  readOnly: boolean;
}

/**
 * Permissions du rôle courant sur un module.
 * Sert à masquer les boutons ; l'API refait le contrôle côté serveur.
 */
export function usePermissions(module: ModuleKey): Permissions {
  const { lvl } = useRbac();
  const level = lvl(module);

  return useMemo(
    () => ({
      level,
      canRead: level >= 1,
      canWrite: level >= 2,
      canDelete: level >= 3,
      readOnly: level === 1,
    }),
    [level],
  );
}
