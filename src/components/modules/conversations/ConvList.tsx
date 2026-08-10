import type { ConvFilter, ConvListItem } from '@/api/conversations';
import Badge from '@/components/ui/Badge';
import { CONV_STATUS_LABELS, CONV_STATUS_TONES } from '@/labels';
import { Colors, Radius } from '@/theme/tokens';

const CONV_FILTERS: { key: ConvFilter; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'unread', label: 'Non lues' },
  { key: 'pending', label: 'En attente' },
  { key: 'mine', label: 'À moi' },
  { key: 'resolved', label: 'Résolues' },
];

interface Props {
  items: ConvListItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  filter: ConvFilter;
  onFilter: (filter: ConvFilter) => void;
  query: string;
  onQuery: (query: string) => void;
  /** Compteur du filtre « Non lues », renvoyé par la liste elle-même. */
  unreadCount: number;
  loading: boolean;
}

export default function ConvList({
  items,
  selectedId,
  onSelect,
  filter,
  onFilter,
  query,
  onQuery,
  unreadCount,
  loading,
}: Props) {
  return (
    <div
      style={{
        width: 290,
        flex: 'none',
        border: `1px solid ${Colors.border}`,
        borderRadius: Radius.lg,
        background: Colors.surface,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: 10,
          borderBottom: '1px solid rgba(255,255,255,.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <input
          className="sas-input"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Rechercher une conversation"
          style={{
            height: 32,
            border: `1px solid rgba(255,255,255,.11)`,
            borderRadius: 7,
            background: Colors.sidebar,
            color: Colors.textPrimary,
            fontSize: 12,
            padding: '0 10px',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {CONV_FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onFilter(f.key)}
                className="sas-btn-ghost"
                style={{
                  height: 26,
                  padding: '0 9px',
                  border: `1px solid ${active ? 'rgba(9,92,255,.4)' : 'rgba(255,255,255,.11)'}`,
                  borderRadius: Radius.sm,
                  background: active ? 'rgba(9,92,255,.18)' : 'transparent',
                  color: active ? '#9CC0FF' : 'rgba(255,255,255,.55)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {f.label}
                {f.key === 'unread' && unreadCount > 0 ? ` ${unreadCount}` : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading && items.length === 0 && (
          <p style={{ margin: 0, padding: '14px 12px', fontSize: 12, color: Colors.text45 }}>
            Chargement…
          </p>
        )}

        {!loading && items.length === 0 && (
          <p style={{ margin: 0, padding: '14px 12px', fontSize: 12, color: Colors.text45 }}>
            Aucune conversation pour ce filtre.
          </p>
        )}

        {items.map((c) => {
          const active = c.id === selectedId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className="sas-row"
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '10px 12px',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,.05)',
                // Barre bleue à gauche : conversation ouverte ou non lue.
                borderLeft: `2px solid ${active ? Colors.blue : c.unread ? Colors.blueMid : 'transparent'}`,
                background: active ? 'rgba(255,255,255,.06)' : 'transparent',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: c.unread ? 600 : 400,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.client}
                </span>
                <span style={{ fontSize: 11, color: Colors.text40, flex: 'none' }}>{c.time}</span>
              </span>

              <span
                style={{
                  fontSize: 12,
                  lineHeight: '16px',
                  color: Colors.text50,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                }}
              >
                {c.preview || '—'}
              </span>

              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Badge tone={CONV_STATUS_TONES[c.status]} size="sm">
                  {CONV_STATUS_LABELS[c.status]}
                </Badge>
                <span style={{ fontSize: 10, color: Colors.text35 }}>
                  {c.assignee ? `Assignée à ${c.assignee}` : 'Non assignée'}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
