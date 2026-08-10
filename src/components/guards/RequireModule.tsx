import type { ReactNode } from 'react';
import DeniedPage from '@/pages/DeniedPage';
import { usePermissions } from '@/hooks/usePermissions';
import type { ModuleKey } from '@/types';

interface Props {
  module: ModuleKey;
  children: ReactNode;
}

/**
 * Niveau 0 sur le module → écran « Accès refusé » à la place du contenu.
 * On reste sur l'URL demandée plutôt que de rediriger : le Shell et sa nav
 * restent en place, l'utilisateur voit où il a été bloqué.
 */
export default function RequireModule({ module, children }: Props) {
  const { canRead } = usePermissions(module);
  return canRead ? <>{children}</> : <DeniedPage module={module} />;
}
