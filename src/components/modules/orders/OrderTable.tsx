import type { OrderRow } from '@/api/orders';
import Badge from '@/components/ui/Badge';
import { ORDER_STATE_LABELS, ORDER_STATE_TONES, PAYMENT_METHOD_LABELS } from '@/labels';
import { Colors } from '@/theme/tokens';

const COLS = {
  ref: { width: 110, flex: 'none' as const },
  client: { flex: 1, minWidth: 170 },
  pack: { width: 150, flex: 'none' as const },
  amount: { width: 110, flex: 'none' as const },
  payment: { width: 100, flex: 'none' as const },
  state: { width: 130, flex: 'none' as const },
  action: { width: 170, flex: 'none' as const },
};

interface Props {
  items: OrderRow[];
  canWrite: boolean;
  onAdvance: (order: OrderRow) => void;
  busyRef: string | null;
  loading: boolean;
}

export default function OrderTable({ items, canWrite, onAdvance, busyRef, loading }: Props) {
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
        <span style={COLS.ref}>RÉF.</span>
        <span style={COLS.client}>CLIENT</span>
        <span style={COLS.pack}>PACK</span>
        <span style={COLS.amount}>MONTANT</span>
        <span style={COLS.payment}>PAIEMENT</span>
        <span style={COLS.state}>ÉTAT</span>
        <span style={{ ...COLS.action, textAlign: 'right' }}>ACTION</span>
      </div>

      {items.length === 0 && (
        <p style={{ margin: 0, padding: '18px 14px', fontSize: 12, color: Colors.text45 }}>
          {loading ? 'Chargement…' : 'Aucune commande.'}
        </p>
      )}

      {items.map((o) => (
        <div
          key={o.ref}
          className="sas-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderBottom: '1px solid rgba(255,255,255,.05)',
            fontSize: 13,
            opacity: busyRef === o.ref ? 0.6 : 1,
          }}
        >
          <span style={{ ...COLS.ref, color: Colors.text70, fontSize: 12 }}>{o.ref}</span>

          <span style={{ ...COLS.client, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ color: '#fff' }}>{o.client}</span>
            <span style={{ fontSize: 11, color: Colors.text40 }}>{o.handle}</span>
          </span>

          <span style={{ ...COLS.pack, color: Colors.text70, fontSize: 12 }}>{o.pack}</span>
          <span style={{ ...COLS.amount, fontSize: 13 }}>{o.amount}</span>
          <span style={{ ...COLS.payment, color: Colors.text70, fontSize: 12 }}>
            {PAYMENT_METHOD_LABELS[o.paymentMethod]}
          </span>

          <span style={COLS.state}>
            <Badge tone={ORDER_STATE_TONES[o.state]}>{ORDER_STATE_LABELS[o.state]}</Badge>
          </span>

          <span style={{ ...COLS.action, display: 'flex', justifyContent: 'flex-end' }}>
            {canWrite && o.nextState ? (
              <button
                type="button"
                onClick={() => onAdvance(o)}
                disabled={busyRef === o.ref}
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
                → {ORDER_STATE_LABELS[o.nextState]}
              </button>
            ) : (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
                {o.nextState ? '—' : 'Archivée'}
              </span>
            )}
          </span>
        </div>
      ))}
    </>
  );
}
