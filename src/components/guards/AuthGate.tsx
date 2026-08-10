import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Splash from '@/components/ui/Splash';
import { useAuthStore } from '@/store/authStore';

/**
 * Route racine : vérifie le token stocké (GET /api/me) avant de laisser
 * quoi que ce soit se monter. Sans ce sas, /login clignoterait à chaque
 * rechargement le temps que la réponse arrive.
 */
export default function AuthGate() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    if (status === 'idle') void bootstrap();
  }, [status, bootstrap]);

  if (status === 'idle' || status === 'checking') {
    return <Splash label="Vérification de la session…" />;
  }

  return <Outlet />;
}
