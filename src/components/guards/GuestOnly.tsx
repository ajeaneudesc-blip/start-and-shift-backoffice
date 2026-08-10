import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/** /login : inaccessible quand une session est déjà ouverte. */
export default function GuestOnly() {
  const status = useAuthStore((s) => s.status);
  return status === 'authenticated' ? <Navigate to="/" replace /> : <Outlet />;
}
