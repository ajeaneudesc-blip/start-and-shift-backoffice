import type { ReactNode } from 'react';
import { Colors, Radius } from '@/theme/tokens';

interface Props {
  title: string;
  desc?: string;
  /**
   * Libellé du bouton principal. Sans `onAction`, le bouton reste affiché mais
   * grisé : l'API n'expose pas encore d'endpoint pour Exporter, Inviter,
   * Nouvelle commande ni Ajouter un modèle.
   */
  action?: string;
  onAction?: () => void;
  /** Contenu libre à droite du titre (filtres, compteurs…). */
  children?: ReactNode;
}

const COMING_SOON = 'Bientôt disponible';

export default function PageHeader({ title, desc, action, onAction, children }: Props) {
  const inert = !onAction;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-.01em' }}>
          {title}
        </h1>
        {desc && (
          <p style={{ margin: 0, fontSize: 13, lineHeight: '19px', color: Colors.text50 }}>{desc}</p>
        )}
      </div>

      {children}

      {action && (
        // `title` sur un bouton désactivé n'affiche pas d'infobulle dans
        // Chrome : c'est le span englobant qui la porte.
        <span title={inert ? COMING_SOON : undefined} style={{ flex: 'none', display: 'flex' }}>
          <button
            type="button"
            onClick={onAction}
            disabled={inert}
            aria-describedby={inert ? 'sas-coming-soon' : undefined}
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
              // Le style inline l'emporte sur la règle `button:disabled` du CSS.
              cursor: inert ? 'not-allowed' : 'pointer',
              transition: 'background 160ms ease',
            }}
          >
            {action}
          </button>
          {inert && (
            <span id="sas-coming-soon" style={{ position: 'absolute', left: -9999 }}>
              {COMING_SOON}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
