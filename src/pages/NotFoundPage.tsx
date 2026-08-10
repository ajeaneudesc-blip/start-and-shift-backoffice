import { Link } from 'react-router-dom';
import { Colors, Radius } from '@/theme/tokens';

export default function NotFoundPage() {
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
        <span style={{ fontSize: 15, fontWeight: 600 }}>Page introuvable</span>
        <span style={{ fontSize: 13, lineHeight: '19px', color: Colors.text50 }}>
          Cette adresse ne correspond à aucun module.
        </span>
        <Link to="/" style={{ fontSize: 13, marginTop: 4 }}>
          Retour à la vue d'ensemble
        </Link>
      </div>
    </div>
  );
}
