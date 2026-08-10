import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import type { ConvDetail, ConvMessage } from '@/api/conversations';
import { formatTime } from '@/format';
import { Colors, Radius } from '@/theme/tokens';
import type { MessageFrom } from '@/types';

/** Le client à gauche ; l'équipe et l'assistant à droite, comme au prototype. */
const BUBBLE: Record<MessageFrom, { bg: string; bd: string }> = {
  client: { bg: 'rgba(255,255,255,.05)', bd: 'rgba(255,255,255,.09)' },
  assistant: { bg: 'rgba(255,145,94,.10)', bd: 'rgba(255,145,94,.24)' },
  equipe: { bg: 'rgba(9,92,255,.16)', bd: 'rgba(9,92,255,.32)' },
};

function authorOf(msg: ConvMessage, clientName: string): string {
  if (msg.from === 'client') return clientName;
  return msg.from === 'assistant' ? 'Assistant' : 'Équipe';
}

interface Props {
  conv: ConvDetail;
  canWrite: boolean;
  onSend: (text: string) => Promise<unknown>;
  onAssignSelf: () => void;
  onToggleResolved: () => void;
  /** Vrai pendant un PATCH : évite le double clic sur les deux boutons. */
  busy: boolean;
  sendError: string | null;
}

export default function ConvChat({
  conv,
  canWrite,
  onSend,
  onAssignSelf,
  onToggleResolved,
  busy,
  sendError,
}: Props) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Le fil s'ouvre sur le dernier message, puis suit chaque nouvel envoi.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conv.id, conv.messages.length]);

  // Changer de conversation ne doit pas emporter le brouillon dans l'autre fil.
  useEffect(() => setDraft(''), [conv.id]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      await onSend(text);
      setDraft('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        flex: 1,
        minWidth: 340,
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
          flex: 'none',
          padding: '11px 14px',
          borderBottom: '1px solid rgba(255,255,255,.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            flex: 'none',
            borderRadius: Radius.md,
            background: 'rgba(255,255,255,.07)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {conv.client.trim().slice(0, 1).toUpperCase()}
        </span>

        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{conv.client}</span>
          <span style={{ fontSize: 11, color: Colors.text45 }}>
            {conv.handle} · {conv.tag}
          </span>
        </span>

        {canWrite && (
          <>
            <button
              type="button"
              onClick={onAssignSelf}
              disabled={busy}
              className="sas-btn-ghost"
              style={{
                height: 28,
                padding: '0 10px',
                border: `1px solid ${Colors.borderMid}`,
                borderRadius: 7,
                background: 'transparent',
                color: Colors.text85,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              M'attribuer
            </button>
            <button
              type="button"
              onClick={onToggleResolved}
              disabled={busy}
              className="sas-btn-primary"
              style={{
                height: 28,
                padding: '0 10px',
                border: 'none',
                borderRadius: 7,
                background: Colors.blue,
                color: '#fff',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {conv.status === 'RESOLUE' ? 'Rouvrir' : 'Marquer résolue'}
            </button>
          </>
        )}
      </div>

      <div
        ref={scroller}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {conv.messages.length === 0 && (
          <p style={{ margin: 'auto', fontSize: 12, color: Colors.text45 }}>
            Aucun message dans ce fil.
          </p>
        )}

        {conv.messages.map((m) => {
          const mine = m.from !== 'client';
          const tone = BUBBLE[m.from];
          return (
            <div
              key={m.id}
              style={{
                maxWidth: '76%',
                alignSelf: mine ? 'flex-end' : 'flex-start',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div
                style={{
                  border: `1px solid ${tone.bd}`,
                  borderRadius: Radius.lg,
                  padding: '9px 11px',
                  background: tone.bg,
                  fontSize: 13,
                  lineHeight: '19px',
                  color: 'rgba(255,255,255,.92)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.text}
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: Colors.text35,
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                }}
              >
                {authorOf(m, conv.client)} · {m.time ?? formatTime(m.createdAt)}
              </span>
            </div>
          );
        })}
      </div>

      {canWrite && (
        <form
          onSubmit={submit}
          style={{
            flex: 'none',
            borderTop: '1px solid rgba(255,255,255,.07)',
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {sendError && (
            <span style={{ fontSize: 11, color: Colors.danger.fg }} role="alert">
              {sendError}
            </span>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="sas-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Répondre au client…"
              style={{
                flex: 1,
                height: 34,
                border: '1px solid rgba(255,255,255,.11)',
                borderRadius: Radius.md,
                background: Colors.sidebar,
                color: Colors.textPrimary,
                fontSize: 13,
                padding: '0 12px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="sas-btn-primary"
              style={{
                height: 34,
                padding: '0 14px',
                border: 'none',
                borderRadius: Radius.md,
                background: Colors.blue,
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                flex: 'none',
              }}
            >
              {sending ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
