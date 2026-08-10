import type { CSSProperties } from 'react';
import type { Kpi, Trend } from '@/api/overview';
import { normalizeSpaces } from '@/format';
import { Colors, Radius } from '@/theme/tokens';

/** Une hausse est verte, une baisse orange ; le reste est neutre (prototype). */
function deltaColor(trend: Trend): string {
  if (trend === 'up') return Colors.ok.fg;
  if (trend === 'down') return Colors.orangeMid;
  return Colors.text50;
}

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 12,
  marginBottom: 20,
};

const card: CSSProperties = {
  border: `1px solid ${Colors.border}`,
  borderRadius: Radius.lg,
  padding: 14,
  background: Colors.surface,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

export default function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <div style={grid}>
      {kpis.map((k) => (
        <div key={k.key} style={card}>
          <span style={{ fontSize: 11, letterSpacing: '.06em', color: Colors.text50 }}>
            {k.label}
          </span>
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.02em' }}>
            {normalizeSpaces(k.display)}
          </span>
          <span style={{ fontSize: 11, color: deltaColor(k.trend) }}>{k.delta}</span>
        </div>
      ))}
    </div>
  );
}

/** Même gabarit, sans données : évite le saut de mise en page au chargement. */
export function KpiGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div style={grid}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ ...card, height: 92 }}>
          <span style={{ width: 64, height: 9, borderRadius: 4, background: 'rgba(255,255,255,.07)' }} />
          <span style={{ width: 96, height: 20, borderRadius: 5, background: 'rgba(255,255,255,.09)' }} />
          <span style={{ width: 80, height: 9, borderRadius: 4, background: 'rgba(255,255,255,.05)' }} />
        </div>
      ))}
    </div>
  );
}
