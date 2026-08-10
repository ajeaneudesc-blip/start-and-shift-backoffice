import type { TemplateRow } from '@/api/templates';
import Badge from '@/components/ui/Badge';
import { TEMPLATE_STATE_LABELS } from '@/labels';
import { Colors, Radius } from '@/theme/tokens';

/** Placeholder hachuré du prototype, en attendant les vignettes réelles. */
const PREVIEW_BACKGROUND =
  'repeating-linear-gradient(135deg,rgba(255,255,255,.045) 0 10px,rgba(255,255,255,.02) 10px 20px)';

interface Props {
  items: TemplateRow[];
  canWrite: boolean;
  onToggle: (template: TemplateRow) => void;
  busyId: number | null;
  loading: boolean;
}

export default function TemplateGrid({ items, canWrite, onToggle, busyId, loading }: Props) {
  if (items.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: 12, color: Colors.text45 }}>
        {loading ? 'Chargement…' : 'Aucun modèle dans la bibliothèque.'}
      </p>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {items.map((t) => (
        <div
          key={t.id}
          style={{
            border: `1px solid ${Colors.border}`,
            borderRadius: Radius.lg,
            background: Colors.surface,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            opacity: busyId === t.id ? 0.6 : 1,
          }}
        >
          <div
            style={{
              height: 96,
              background: PREVIEW_BACKGROUND,
              display: 'grid',
              placeItems: 'center',
              fontSize: 11,
              color: Colors.text35,
            }}
          >
            visuel à intégrer
          </div>

          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</span>
            <span style={{ fontSize: 11, color: Colors.text45 }}>{t.meta}</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <Badge tone={t.state === 'PUBLIE' ? 'ok' : 'muted'}>
                {TEMPLATE_STATE_LABELS[t.state]}
              </Badge>
              <span style={{ flex: 1 }} />
              {canWrite && (
                <button
                  type="button"
                  onClick={() => onToggle(t)}
                  disabled={busyId === t.id}
                  className="sas-btn-ghost"
                  style={{
                    height: 26,
                    padding: '0 10px',
                    border: `1px solid ${Colors.borderMid}`,
                    borderRadius: 7,
                    background: 'transparent',
                    color: Colors.text85,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {t.state === 'PUBLIE' ? 'Dépublier' : 'Publier'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
