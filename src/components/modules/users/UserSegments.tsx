import type { UserSegment, UsersResponse } from '@/api/users';
import { formatCount } from '@/format';
import { Colors } from '@/theme/tokens';

const SEGMENTS: { key: UserSegment; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'actifs', label: 'Actifs' },
  { key: 'invites', label: 'Invités' },
  { key: 'suspendus', label: 'Suspendus' },
  { key: 'pro', label: 'Pro' },
];

interface Props {
  segment: UserSegment;
  onSegment: (segment: UserSegment) => void;
  /** Comptages renvoyés avec la page courante : ils suivent la recherche. */
  counts?: UsersResponse['segmentCounts'];
  rangeLabel: string;
}

export default function UserSegments({ segment, onSegment, counts, rangeLabel }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        flexWrap: 'wrap',
      }}
    >
      {SEGMENTS.map((s) => {
        const active = s.key === segment;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onSegment(s.key)}
            className="sas-btn-ghost"
            style={{
              height: 28,
              padding: '0 11px',
              border: `1px solid ${active ? 'rgba(9,92,255,.4)' : Colors.borderMid}`,
              borderRadius: 7,
              background: active ? 'rgba(9,92,255,.18)' : 'transparent',
              color: active ? '#9CC0FF' : 'rgba(255,255,255,.65)',
              fontSize: 12,
              cursor: 'pointer',
              transition: 'background 160ms ease',
            }}
          >
            {s.label}{' '}
            <span style={{ color: Colors.text40 }}>
              {counts ? formatCount(counts[s.key]) : ''}
            </span>
          </button>
        );
      })}

      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 12, color: Colors.text45 }}>{rangeLabel}</span>
    </div>
  );
}
