import type { RolesMatrix } from '@/api/roles';
import Badge from '@/components/ui/Badge';
import { Colors, Radius } from '@/theme/tokens';
import type { Tone } from '@/theme/tones';
import type { PermLevel } from '@/types';

/** Total = bleu · Écriture = vert · Lecture = gris · Aucun = rouge (§7.6). */
const LEVEL_TONES: Record<PermLevel, Tone> = {
  3: 'info',
  2: 'ok',
  1: 'muted',
  0: 'danger',
};

const LEGEND = [
  'Total — voir, modifier, supprimer',
  'Écriture — voir et modifier',
  'Lecture — voir seulement',
  'Aucun — module masqué',
];

export default function RoleMatrix({ data }: { data: RolesMatrix }) {
  return (
    <>
      <div
        style={{
          border: `1px solid ${Colors.border}`,
          borderRadius: Radius.lg,
          background: Colors.surface,
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 14px',
            borderBottom: '1px solid rgba(255,255,255,.07)',
            fontSize: 11,
            letterSpacing: '.05em',
            color: Colors.text45,
          }}
        >
          <span style={{ width: 200, flex: 'none' }}>MODULE</span>
          {data.roles.map((r) => (
            <span key={r.key} style={{ flex: 1, textAlign: 'center' }} title={r.desc}>
              {r.label.toUpperCase()}
            </span>
          ))}
        </div>

        {data.modules.map((m) => (
          <div
            key={m.key}
            className="sas-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '11px 14px',
              borderBottom: '1px solid rgba(255,255,255,.05)',
              fontSize: 13,
            }}
          >
            <span
              style={{ width: 200, flex: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <span style={{ color: '#fff' }}>{m.label}</span>
              <span style={{ fontSize: 11, color: Colors.text40 }}>{m.key}</span>
            </span>

            {data.roles.map((r) => {
              const level = data.matrix[m.key][r.key];
              return (
                <span key={r.key} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <Badge tone={LEVEL_TONES[level]}>{data.levels[level]}</Badge>
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 11, color: Colors.text50 }}>
        {LEGEND.map((text) => (
          <span key={text}>{text}</span>
        ))}
      </div>
    </>
  );
}
