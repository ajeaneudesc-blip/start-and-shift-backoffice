import type { ReactNode } from 'react';
import type { ConvDetail } from '@/api/conversations';
import Badge from '@/components/ui/Badge';
import {
  CONV_STATUS_LABELS,
  ORDER_STATE_LABELS,
  ORDER_STATE_TONES,
  PLAN_LABELS,
} from '@/labels';
import { Colors, Radius } from '@/theme/tokens';

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      style={{
        border: `1px solid ${Colors.border}`,
        borderRadius: Radius.lg,
        background: Colors.surface,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 10, letterSpacing: '.14em', color: Colors.text40 }}>{title}</span>
      {children}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 12 }}>
      <span style={{ width: 82, flex: 'none', color: Colors.text45 }}>{label}</span>
      <span style={{ flex: 1, color: 'rgba(255,255,255,.9)', minWidth: 0 }}>{value}</span>
    </span>
  );
}

/** Fiche client : identité, contexte du diagnostic et commande rattachée. */
export default function ConvSidebar({ conv }: { conv: ConvDetail }) {
  const diag = conv.diagContext;
  const cibles = diag?.cibles?.length ? diag.cibles.join(', ') : null;

  return (
    <div style={{ width: 250, flex: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card title="CLIENT">
        <Fact label="Pseudo" value={conv.handle} />
        <Fact label="Plan" value={PLAN_LABELS[conv.plan]} />
        <Fact label="Statut" value={CONV_STATUS_LABELS[conv.status]} />
        <Fact label="Assignée à" value={conv.assignee ?? 'personne'} />
        <Fact label="Sujet" value={conv.tag} />
      </Card>

      <Card title="DIAGNOSTIC">
        {diag?.resume ? (
          <>
            <span style={{ fontSize: 12, lineHeight: '18px', color: 'rgba(255,255,255,.75)' }}>
              {diag.resume}
            </span>
            {cibles && <Fact label="Cibles" value={cibles} />}
            {diag.ton && <Fact label="Ton" value={diag.ton} />}
          </>
        ) : (
          <span style={{ fontSize: 12, lineHeight: '18px', color: Colors.text45 }}>
            Aucun diagnostic au moment de l'ouverture du fil.
          </span>
        )}
      </Card>

      <Card title="COMMANDE LIÉE">
        {conv.order ? (
          <>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.9)' }}>
              {conv.order.ref} · {conv.order.pack}
            </span>
            <span>
              <Badge tone={ORDER_STATE_TONES[conv.order.state]} size="sm">
                {ORDER_STATE_LABELS[conv.order.state]}
              </Badge>
            </span>
          </>
        ) : (
          <span style={{ fontSize: 12, color: Colors.text45 }}>Aucune commande rattachée.</span>
        )}
      </Card>
    </div>
  );
}
