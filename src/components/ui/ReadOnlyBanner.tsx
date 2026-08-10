import { useRbac } from '@/hooks/useRbac';
import { Colors } from '@/theme/tokens';

/**
 * Bannière orange affichée au-dessus d'un module ouvert en niveau 1.
 * Le message nomme le rôle : en simulation, on voit tout de suite lequel bloque.
 */
export default function ReadOnlyBanner({ message }: { message?: string }) {
  const { roleMeta } = useRbac();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        border: '1px solid rgba(255,145,94,.3)',
        background: 'rgba(255,145,94,.09)',
        borderRadius: 9,
        padding: '10px 12px',
        fontSize: 12,
        lineHeight: '18px',
        color: Colors.orangeMid,
        marginBottom: 18,
      }}
    >
      {message ?? `Lecture seule : le rôle ${roleMeta.label} ne peut pas modifier ce module.`}
    </div>
  );
}
