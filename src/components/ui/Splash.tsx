import { Colors } from '@/theme/tokens';

/** Écran d'attente plein cadre — utilisé pendant la vérification du token. */
export default function Splash({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        background: Colors.bg,
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `2px solid ${Colors.borderMid}`,
          borderTopColor: Colors.blueMid,
          animation: 'sas-spin 700ms linear infinite',
        }}
      />
      <span style={{ fontSize: 12, color: Colors.text45 }}>{label}</span>
    </div>
  );
}
