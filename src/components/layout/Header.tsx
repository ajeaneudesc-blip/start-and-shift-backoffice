import { ROLES, useEffectiveRole } from '@/hooks/useRbac';
import { useAuthStore } from '@/store/authStore';
import { Colors, Layout, Radius } from '@/theme/tokens';
import type { RoleKey } from '@/types';

/**
 * Le sélecteur de rôle sert à vérifier les périmètres pendant le développement.
 * En production le rôle vient du JWT et le groupe de boutons disparaît (§10).
 */
const ROLE_SWITCHER_ENABLED = import.meta.env.DEV;

function initialOf(name: string | undefined): string {
  return (name?.trim()[0] ?? '?').toUpperCase();
}

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const simulatedRole = useAuthStore((s) => s.simulatedRole);
  const setSimulatedRole = useAuthStore((s) => s.setSimulatedRole);
  const signOut = useAuthStore((s) => s.signOut);
  const role = useEffectiveRole();

  function pick(key: RoleKey) {
    // Re-cliquer sur son propre rôle revient à couper la simulation.
    setSimulatedRole(key === role && simulatedRole ? null : key);
  }

  return (
    <header
      style={{
        height: Layout.headerHeight,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '0 20px',
        borderBottom: `1px solid ${Colors.border}`,
        background: Colors.header,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 'none' }}>
        <img
          src="/logo.png"
          alt="START AND SHIFT"
          style={{ width: 26, height: 26, objectFit: 'contain', display: 'block' }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-.01em' }}>Backoffice</span>
        <span
          style={{
            fontSize: 11,
            color: Colors.text45,
            paddingLeft: 8,
            borderLeft: '1px solid rgba(255,255,255,.12)',
          }}
        >
          START AND SHIFT
        </span>
      </div>

      <span style={{ flex: 1 }} />

      {ROLE_SWITCHER_ENABLED && (
        <>
          <span style={{ fontSize: 11, color: Colors.text45 }}>
            {simulatedRole ? 'Rôle simulé' : 'Connecté en tant que'}
          </span>
          <div
            style={{
              display: 'flex',
              gap: 2,
              background: 'rgba(255,255,255,.05)',
              border: `1px solid ${Colors.border}`,
              borderRadius: 9,
              padding: 3,
            }}
          >
            {ROLES.map((r) => {
              const active = r.key === role;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => pick(r.key)}
                  className="sas-role-tab"
                  title={r.desc}
                  style={{
                    height: 28,
                    padding: '0 12px',
                    border: 'none',
                    borderRadius: 7,
                    background: active ? Colors.blue : 'transparent',
                    color: active ? '#fff' : Colors.text50,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 160ms ease, color 160ms ease',
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => void signOut()}
        className="sas-btn-ghost"
        style={{
          height: 28,
          padding: '0 10px',
          border: `1px solid ${Colors.borderMid}`,
          borderRadius: 7,
          background: 'transparent',
          color: Colors.text70,
          fontSize: 12,
          cursor: 'pointer',
          flex: 'none',
        }}
      >
        Déconnexion
      </button>

      <span
        title={`${user?.firstName ?? ''} ${user?.pseudo ?? ''}`.trim()}
        style={{
          width: 28,
          height: 28,
          flex: 'none',
          borderRadius: Radius.md,
          background: 'rgba(9,92,255,.25)',
          color: Colors.blueMid,
          display: 'grid',
          placeItems: 'center',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {initialOf(user?.firstName)}
      </span>
    </header>
  );
}
