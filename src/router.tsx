import { createBrowserRouter } from 'react-router-dom';
import AuthGate from '@/components/guards/AuthGate';
import GuestOnly from '@/components/guards/GuestOnly';
import RequireAuth from '@/components/guards/RequireAuth';
import RequireModule from '@/components/guards/RequireModule';
import AuditPage from '@/pages/AuditPage';
import ConversationsPage from '@/pages/ConversationsPage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import OrdersPage from '@/pages/OrdersPage';
import OverviewPage from '@/pages/OverviewPage';
import RolesPage from '@/pages/RolesPage';
import TemplatesPage from '@/pages/TemplatesPage';
import UsersPage from '@/pages/UsersPage';

export const router = createBrowserRouter([
  {
    // AuthGate englobe tout : il vérifie le token avant le premier rendu.
    element: <AuthGate />,
    children: [
      {
        element: <GuestOnly />,
        children: [{ path: '/login', element: <LoginPage /> }],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: '/',
            element: (
              <RequireModule module="overview">
                <OverviewPage />
              </RequireModule>
            ),
          },
          {
            path: '/conversations',
            element: (
              <RequireModule module="conv">
                <ConversationsPage />
              </RequireModule>
            ),
          },
          {
            path: '/users',
            element: (
              <RequireModule module="users">
                <UsersPage />
              </RequireModule>
            ),
          },
          {
            path: '/orders',
            element: (
              <RequireModule module="orders">
                <OrdersPage />
              </RequireModule>
            ),
          },
          {
            path: '/templates',
            element: (
              <RequireModule module="templates">
                <TemplatesPage />
              </RequireModule>
            ),
          },
          {
            path: '/roles',
            element: (
              <RequireModule module="roles">
                <RolesPage />
              </RequireModule>
            ),
          },
          {
            path: '/audit',
            element: (
              <RequireModule module="audit">
                <AuditPage />
              </RequireModule>
            ),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
