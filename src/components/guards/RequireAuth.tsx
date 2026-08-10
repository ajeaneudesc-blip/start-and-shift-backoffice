import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Shell from '@/components/layout/Shell';
import { useAuthStore } from '@/store/authStore';

/** Toutes les routes du backoffice : session obligatoire, rendues dans le Shell. */
export default function RequireAuth() {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status !== 'authenticated') {
    // On mémorise la destination pour y revenir après connexion.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}
