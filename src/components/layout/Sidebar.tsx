import { NavLink } from 'react-router-dom';
import type { OverviewCounts } from '@/api/overview';
import { formatCount } from '@/format';
import { useOverview } from '@/hooks/useOverview';
import { ROLES, useRbac } from '@/hooks/useRbac';
import { Colors, Layout, Radius } from '@/theme/tokens';
import type { ModuleKey } from '@/types';

/**
 * Compteurs affichés à droite de chaque entrée. Ils viennent du bloc `counts`
 * de GET /api/overview, comme dans le prototype : les conversations comptent
 * les non lues (rien à afficher s'il n'y en a pas), les autres le total.
 * `roles` n'a pas de compteur côté API : la matrice a toujours cinq colonnes.
 */
function navBadges(counts: OverviewCounts | undefined): Partial<Record<ModuleKey, string>> {
  if (!counts) return {};

  return {
    conv: counts.conv ? String(counts.conv) : undefined,
    users: counts.users === undefined ? undefined : formatCount(counts.users),
    orders: counts.orders === undefined ? undefined : String(counts.orders),
    templates: counts.templates === undefined ? undefined : String(counts.templates),
    roles: String(ROLES.length),
  };
}

export default function Sidebar() {
  const { visibleModules, roleMeta, lvl } = useRbac();
  const { data } = useOverview();
  const counts = navBadges(data?.counts);

  // Un rôle qui ne peut écrire nulle part travaille en consultation.
  const canWriteSomewhere = visibleModules.some((m) => lvl(m.key) >= 2);

  return (
    <nav
      style={{
        width: Layout.sidebarWidth,
        flex: 'none',
        borderRight: `1px solid ${Colors.border}`,
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        background: Colors.sidebar,
      }}
    >
      <span
        style={{
          fontSize: 10,
          letterSpacing: '.16em',
          color: Colors.text35,
          padding: '6px 10px 8px',
        }}
      >
        MODULES
      </span>

      {visibleModules.map((m) => (
        <NavLink
          key={m.key}
          to={m.path}
          end={m.path === '/'}
          className="sas-nav-item"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            height: 34,
            padding: '0 10px',
            borderRadius: Radius.md,
            background: isActive ? 'rgba(9,92,255,.16)' : 'transparent',
            color: isActive ? '#fff' : Colors.text70,
            fontSize: 13,
            fontWeight: isActive ? 600 : 400,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 160ms ease, color 160ms ease',
          })}
        >
          <span style={{ flex: 1 }}>{m.label}</span>
          {counts[m.key] && (
            <span style={{ fontSize: 11, color: Colors.text35 }}>{counts[m.key]}</span>
          )}
        </NavLink>
      ))}

      <div style={{ flex: 1 }} />

      <div
        style={{
          border: `1px solid ${Colors.border}`,
          borderRadius: 9,
          padding: '10px 11px',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{roleMeta.label}</span>
        <span style={{ fontSize: 11, lineHeight: '16px', color: Colors.text50 }}>
          {roleMeta.desc}
        </span>
        <span
          style={{
            fontSize: 11,
            marginTop: 2,
            color: canWriteSomewhere ? Colors.ok.fg : Colors.orangeMid,
          }}
        >
          {canWriteSomewhere ? 'Écriture activée' : 'Lecture seule'}
        </span>
      </div>
    </nav>
  );
}
