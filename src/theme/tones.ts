import { Colors } from '@/theme/tokens';

/** Palette d'un état : couleur de pastille et couple { bg, fg } des badges. */
export type Tone = 'ok' | 'warn' | 'info' | 'muted' | 'danger';

export const TONES: Record<Tone, { bg: string; fg: string }> = {
  ok: Colors.ok,
  warn: Colors.warn,
  info: Colors.info,
  muted: Colors.muted,
  danger: Colors.danger,
};

/**
 * Couleur d'une action du journal (`AuditLog.action`). Reprise du prototype,
 * qui range « Accès » avec « Rôle » en bleu là où la spec l'annonce en gris.
 * Une action inconnue reste neutre plutôt que de disparaître.
 */
const ACTION_TONES: Record<string, Tone> = {
  Rôle: 'info',
  Accès: 'info',
  Compte: 'warn',
  Commande: 'ok',
  Modèle: 'muted',
  Facturation: 'muted',
};

export function toneForAction(action: string): Tone {
  return ACTION_TONES[action] ?? 'muted';
}
