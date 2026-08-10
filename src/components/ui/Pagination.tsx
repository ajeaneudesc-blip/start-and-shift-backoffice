import { Colors } from '@/theme/tokens';

interface Props {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  /** « 1–10 sur 1 301 », calculé par la page appelante. */
  rangeLabel: string;
}

/** Fenêtre de 5 numéros glissant autour de la page courante. */
function pageWindow(page: number, totalPages: number): number[] {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages: number[] = [];
  for (let n = start; n <= end; n++) pages.push(n);
  return pages;
}

const step = (enabled: boolean) => ({
  height: 28,
  padding: '0 11px',
  border: `1px solid ${Colors.borderMid}`,
  borderRadius: 7,
  background: 'transparent',
  color: enabled ? Colors.text85 : 'rgba(255,255,255,.25)',
  fontSize: 12,
  cursor: enabled ? 'pointer' : 'default',
});

export default function Pagination({ page, totalPages, onPage, rangeLabel }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        fontSize: 12,
        color: Colors.text50,
      }}
    >
      <span style={{ flex: 1 }}>{rangeLabel}</span>

      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        style={step(page > 1)}
      >
        Précédent
      </button>

      {pageWindow(page, totalPages).map((n) => {
        const active = n === page;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            className="sas-btn-ghost"
            style={{
              height: 28,
              minWidth: 28,
              padding: '0 8px',
              border: `1px solid ${active ? 'rgba(9,92,255,.4)' : Colors.borderMid}`,
              borderRadius: 7,
              background: active ? 'rgba(9,92,255,.18)' : 'transparent',
              color: active ? '#9CC0FF' : 'rgba(255,255,255,.65)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {n}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        style={step(page < totalPages)}
      >
        Suivant
      </button>
    </div>
  );
}
