import type { AuditEntry } from '@/api/audit';
import Badge from '@/components/ui/Badge';
import { Colors } from '@/theme/tokens';
import { toneForAction } from '@/theme/tones';

const COLS = {
  time: { width: 120, flex: 'none' as const },
  actor: { width: 120, flex: 'none' as const },
  action: { width: 120, flex: 'none' as const },
  target: { flex: 1, minWidth: 200 },
};

export default function AuditLog({ items, loading }: { items: AuditEntry[]; loading: boolean }) {
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
        <span style={COLS.time}>HORODATAGE</span>
        <span style={COLS.actor}>ACTEUR</span>
        <span style={COLS.action}>ACTION</span>
        <span style={COLS.target}>DÉTAIL</span>
      </div>

      {items.length === 0 && (
        <p style={{ margin: 0, padding: '18px 14px', fontSize: 12, color: Colors.text45 }}>
          {loading ? 'Chargement…' : 'Aucune entrée dans le journal.'}
        </p>
      )}

      {items.map((entry) => (
        <div
          key={entry.id}
          className="sas-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderBottom: '1px solid rgba(255,255,255,.05)',
            fontSize: 13,
          }}
        >
          <span style={{ ...COLS.time, color: Colors.text50, fontSize: 12 }}>{entry.time}</span>
          <span style={{ ...COLS.actor, color: Colors.text70, fontSize: 12 }}>{entry.actor}</span>
          <span style={COLS.action}>
            <Badge tone={toneForAction(entry.action)}>{entry.action}</Badge>
          </span>
          <span style={{ ...COLS.target, color: Colors.text85 }}>{entry.target}</span>
        </div>
      ))}
    </>
  );
}
