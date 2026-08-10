import { useState } from 'react';
import type { UserRow } from '@/api/users';
import Badge from '@/components/ui/Badge';
import { USER_ROLE_LABELS, USER_STATUS_LABELS, USER_STATUS_TONES, PLAN_LABELS } from '@/labels';
import { Colors } from '@/theme/tokens';

const COLS = {
  check: { width: 16, flex: 'none' as const },
  user: { flex: 1, minWidth: 170 },
  role: { width: 90, flex: 'none' as const },
  plan: { width: 70, flex: 'none' as const },
  status: { width: 100, flex: 'none' as const },
  seen: { width: 120, flex: 'none' as const },
  actions: { width: 150, flex: 'none' as const },
};

const ghostButton = {
  height: 26,
  padding: '0 10px',
  border: `1px solid ${Colors.borderMid}`,
  borderRadius: 7,
  background: 'transparent',
  color: Colors.text85,
  fontSize: 12,
  cursor: 'pointer',
};

interface Props {
  items: UserRow[];
  selected: number[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  canWrite: boolean;
  canDelete: boolean;
  /** Suspendre ou réactiver une ligne. */
  onToggleStatus: (user: UserRow) => void;
  onDelete: (user: UserRow) => void;
  /** Compte connecté : l'API refuse qu'il se modifie lui-même. */
  selfId?: number;
  busyId: number | null;
  loading: boolean;
}

export default function UserTable({
  items,
  selected,
  onSelect,
  onSelectAll,
  canWrite,
  canDelete,
  onToggleStatus,
  onDelete,
  selfId,
  busyId,
  loading,
}: Props) {
  // Suppression en deux temps : le second clic confirme. Évite une boîte de
  // dialogue native, qui bloquerait la page.
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const allChecked = items.length > 0 && items.every((u) => selected.includes(u.id));

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,.07)',
          fontSize: 11,
          letterSpacing: '.05em',
          color: Colors.text45,
        }}
      >
        <span style={COLS.check}>
          {canWrite && (
            <input
              type="checkbox"
              aria-label="Tout sélectionner"
              checked={allChecked}
              onChange={onSelectAll}
              style={{ width: 14, height: 14, accentColor: Colors.blue, cursor: 'pointer' }}
            />
          )}
        </span>
        <span style={COLS.user}>UTILISATEUR</span>
        <span style={COLS.role}>RÔLE</span>
        <span style={COLS.plan}>PLAN</span>
        <span style={COLS.status}>STATUT</span>
        <span style={COLS.seen}>DERNIÈRE ACTIVITÉ</span>
        <span style={{ ...COLS.actions, textAlign: 'right' }}>ACTIONS</span>
      </div>

      {items.length === 0 && (
        <p style={{ margin: 0, padding: '18px 14px', fontSize: 12, color: Colors.text45 }}>
          {loading ? 'Chargement…' : 'Aucun compte ne correspond à ces filtres.'}
        </p>
      )}

      {items.map((u) => {
        const checked = selected.includes(u.id);
        const isSelf = u.id === selfId;
        const busy = busyId === u.id;

        return (
          <div
            key={u.id}
            className="sas-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '9px 14px',
              borderBottom: '1px solid rgba(255,255,255,.05)',
              fontSize: 13,
              background: checked ? 'rgba(9,92,255,.07)' : 'transparent',
              opacity: busy ? 0.6 : 1,
            }}
          >
            <span style={COLS.check}>
              {canWrite && (
                <input
                  type="checkbox"
                  aria-label={`Sélectionner ${u.handle}`}
                  checked={checked}
                  onChange={() => onSelect(u.id)}
                  style={{ width: 14, height: 14, accentColor: Colors.blue, cursor: 'pointer' }}
                />
              )}
            </span>

            <span style={{ ...COLS.user, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  flex: 'none',
                  borderRadius: 7,
                  background: 'rgba(255,255,255,.07)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,.75)',
                }}
              >
                {u.initial}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {u.name}
                </span>
                <span style={{ fontSize: 11, color: Colors.text40 }}>{u.handle}</span>
              </span>
            </span>

            <span style={{ ...COLS.role, color: Colors.text70, fontSize: 12 }}>
              {USER_ROLE_LABELS[u.role]}
            </span>

            <span
              style={{
                ...COLS.plan,
                color: u.plan === 'PRO' ? Colors.blueMid : Colors.text50,
                fontSize: 12,
              }}
            >
              {PLAN_LABELS[u.plan]}
            </span>

            <span style={COLS.status}>
              <Badge tone={USER_STATUS_TONES[u.status]}>{USER_STATUS_LABELS[u.status]}</Badge>
            </span>

            <span style={{ ...COLS.seen, color: Colors.text50, fontSize: 12 }}>{u.seen}</span>

            <span
              style={{ ...COLS.actions, display: 'flex', justifyContent: 'flex-end', gap: 6 }}
            >
              {canWrite && !isSelf && (
                <button
                  type="button"
                  onClick={() => onToggleStatus(u)}
                  disabled={busy}
                  className="sas-btn-ghost"
                  style={ghostButton}
                >
                  {u.status === 'SUSPENDU' ? 'Réactiver' : 'Suspendre'}
                </button>
              )}

              {canDelete && !isSelf && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirmingId === u.id) {
                      setConfirmingId(null);
                      onDelete(u);
                    } else {
                      setConfirmingId(u.id);
                    }
                  }}
                  onBlur={() => setConfirmingId((id) => (id === u.id ? null : id))}
                  disabled={busy}
                  style={{
                    ...ghostButton,
                    border: '1px solid rgba(255,99,99,.28)',
                    background: confirmingId === u.id ? 'rgba(255,99,99,.12)' : 'transparent',
                    color: Colors.danger.fg,
                  }}
                >
                  {confirmingId === u.id ? 'Confirmer ?' : 'Supprimer'}
                </button>
              )}

              {(!canWrite || isSelf) && !(canDelete && !isSelf) && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>—</span>
              )}
            </span>
          </div>
        );
      })}
    </>
  );
}
