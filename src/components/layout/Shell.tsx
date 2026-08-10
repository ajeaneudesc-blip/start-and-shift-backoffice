import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Colors } from '@/theme/tokens';

/**
 * Ossature commune à toutes les pages connectées : header fixe, nav latérale,
 * zone de contenu seule à défiler. Les modules en 3 panneaux (conversations)
 * comptent sur ce `min-height: 0` pour tenir sans scroll global.
 */
export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: Colors.bg,
      }}
    >
      <Header />
      <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', minHeight: 0 }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: '22px 24px 40px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
