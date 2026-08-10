import { MODULE_BY_KEY, useRbac } from '@/hooks/useRbac';
import { Colors, Radius } from '@/theme/tokens';
import type { ModuleKey } from '@/types';

/** Écran affiché quand le rôle courant est au niveau 0 sur le module demandé. */
export default function DeniedPage({ module }: { module?: ModuleKey }) {
  const { roleMeta } = useRbac();
  const moduleLabel = module ? MODULE_BY_KEY[module]?.title : null;

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: 320, paddingTop: 40 }}>
      <div
        style={{
          width: 380,
          maxWidth: '100%',
          border: `1px solid ${Colors.border}`,
          borderRadius: Radius.lg,
          background: Colors.surface,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Accès refusé</span>
        <span style={{ fontSize: 13, lineHeight: '19px', color: Colors.text50 }}>
          Le rôle {roleMeta.label} n'a pas accès
          {moduleLabel ? ` au module « ${moduleLabel} »` : ' à ce module'}.
        </span>
      </div>
    </div>
  );
}
