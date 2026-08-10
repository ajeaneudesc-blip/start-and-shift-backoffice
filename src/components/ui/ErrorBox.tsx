import { errorMessage } from '@/api/client';
import { Colors, Radius } from '@/theme/tokens';

interface Props {
  /** Erreur brute d'une requête : le texte est déduit par `errorMessage`. */
  error?: unknown;
  /** Texte déjà rédigé — prioritaire sur `error`. */
  message?: string;
  onRetry?: () => void;
}

/** Encart rouge affiché à la place d'un contenu qui n'a pas pu être chargé. */
export default function ErrorBox({ error, message, onRetry }: Props) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: '1px solid rgba(255,99,99,.28)',
        background: Colors.danger.bg,
        borderRadius: Radius.lg,
        padding: '11px 13px',
        fontSize: 12,
        lineHeight: '18px',
        color: Colors.danger.fg,
      }}
    >
      <span style={{ flex: 1 }}>{message ?? errorMessage(error)}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="sas-btn-ghost"
          style={{
            height: 28,
            padding: '0 10px',
            flex: 'none',
            border: `1px solid ${Colors.borderMid}`,
            borderRadius: Radius.md,
            background: 'transparent',
            color: Colors.text70,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
