import type { CSSProperties, ReactNode } from 'react';
import type { ActivityItem } from '@/api/overview';
import { Colors, Radius } from '@/theme/tokens';
import { TONES, toneForAction } from '@/theme/tones';

function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: `1px solid ${Colors.border}`,
        borderRadius: Radius.lg,
        background: Colors.surface,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid rgba(255,255,255,.07)',
          fontSize: 12,
          fontWeight: 600,
          color: Colors.text85,
        }}
      >
        Activité récente
      </div>
      {children}
    </div>
  );
}

const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '11px 14px',
  borderBottom: '1px solid rgba(255,255,255,.05)',
  fontSize: 13,
};

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <Frame>
        <div style={{ ...row, color: Colors.text45, borderBottom: 'none' }}>
          Aucune action enregistrée pour l'instant.
        </div>
      </Frame>
    );
  }

  return (
    <Frame>
      {items.map((a) => (
        <div key={a.id} style={row} title={a.kind}>
          <span
            style={{
              width: 6,
              height: 6,
              flex: 'none',
              borderRadius: '50%',
              background: TONES[toneForAction(a.kind)].fg,
            }}
          />
          <span style={{ flex: 1, color: Colors.text85 }}>{a.text}</span>
          <span style={{ fontSize: 11, color: Colors.text40, flex: 'none' }}>{a.time}</span>
        </div>
      ))}
    </Frame>
  );
}

/** Lignes grisées pendant le chargement — même hauteur que les vraies. */
export function ActivityFeedSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Frame>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={row}>
          <span
            style={{
              width: 6,
              height: 6,
              flex: 'none',
              borderRadius: '50%',
              background: 'rgba(255,255,255,.12)',
            }}
          />
          <span
            style={{
              flex: 1,
              height: 9,
              borderRadius: 4,
              background: 'rgba(255,255,255,.06)',
              maxWidth: 320 + i * 24,
            }}
          />
        </div>
      ))}
    </Frame>
  );
}
