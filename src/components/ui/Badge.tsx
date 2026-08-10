import type { ReactNode } from 'react';
import { TONES, type Tone } from '@/theme/tones';

interface Props {
  tone?: Tone;
  children: ReactNode;
  /** `sm` : la variante compacte des listes de conversations (19px). */
  size?: 'sm' | 'md';
}

/**
 * Pastille de statut. Gabarit du prototype : 22px de haut, 11px de texte,
 * padding horizontal de 9px — identique dans toutes les tables.
 */
export default function Badge({ tone = 'muted', children, size = 'md' }: Props) {
  const small = size === 'sm';
  const { bg, fg } = TONES[tone];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: small ? 19 : 22,
        padding: small ? '0 7px' : '0 9px',
        borderRadius: small ? 5 : 6,
        background: bg,
        color: fg,
        fontSize: small ? 10 : 11,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
