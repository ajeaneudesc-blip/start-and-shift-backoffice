import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as authApi from '@/api/auth';
import { apiErrorCode, isNetworkError } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { Colors, Radius } from '@/theme/tokens';

/** Même phrase aux deux endroits où la porte se ferme à un compte client. */
const REFUS_CLIENT = "Ce compte n'a pas accès au backoffice.";

const MESSAGES: Record<string, string> = {
  invalid_body: 'Renseignez votre pseudo et votre mot de passe.',
  // Volontairement identique pour un pseudo inconnu, un compte client et un
  // mot de passe faux : distinguer les cas permettrait d'énumérer les pseudos
  // de l'équipe, que les clients voient dans les conversations.
  invalid_credentials: 'Pseudo ou mot de passe incorrect.',
  account_suspended: 'Ce compte est suspendu. Contactez un administrateur.',
  too_many_requests: 'Trop de tentatives. Réessayez dans quelques minutes.',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((s) => s.signIn);

  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;

    if (!pseudo.trim() || !password) {
      setError(MESSAGES.invalid_body);
      return;
    }

    setPending(true);
    setError(null);
    try {
      const session = await authApi.login(pseudo.trim(), password);

      // Ceinture et bretelles : l'API refuse déjà les CLIENT sur cette route,
      // puisqu'ils n'ont pas de mot de passe. Si jamais l'un d'eux en obtenait
      // un, la matrice le ferait passer pour un « viewer » et lui ouvrirait
      // des écrans qui ne le regardent pas.
      if (session.user.role === 'CLIENT') {
        await authApi.revokeSession(session.token).catch(() => {});
        setError(REFUS_CLIENT);
        return;
      }

      signIn(session);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (isNetworkError(err)) {
        setError("L'API est injoignable. Vérifiez qu'elle tourne sur " + import.meta.env.VITE_API_URL + '.');
      } else {
        const code = apiErrorCode(err);
        setError((code && MESSAGES[code]) || 'Connexion impossible. Réessayez.');
      }
    } finally {
      setPending(false);
    }
  }

  const fieldStyle = {
    height: 38,
    border: `1px solid ${Colors.borderMid}`,
    borderRadius: Radius.md,
    background: Colors.bg,
    color: Colors.textPrimary,
    fontSize: 13,
    padding: '0 12px',
    outline: 'none',
  } as const;

  const labelStyle = { fontSize: 11, letterSpacing: '.05em', color: Colors.text45 } as const;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: Colors.bg,
        padding: 24,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: 360,
          maxWidth: '100%',
          border: `1px solid ${Colors.border}`,
          borderRadius: Radius.xl,
          background: Colors.surface,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 11, letterSpacing: '.16em', color: Colors.text35 }}>
            START AND SHIFT
          </span>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-.01em' }}>
            Backoffice
          </h1>
          <p style={{ margin: 0, fontSize: 13, lineHeight: '19px', color: Colors.text50 }}>
            Connectez-vous avec votre pseudo et votre mot de passe.
          </p>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={labelStyle}>PSEUDO</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 38,
              border: `1px solid ${Colors.borderMid}`,
              borderRadius: Radius.md,
              background: Colors.bg,
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                padding: '0 10px',
                fontSize: 13,
                color: Colors.text50,
                borderRight: `1px solid ${Colors.border}`,
                lineHeight: '36px',
              }}
            >
              @
            </span>
            <input
              className="sas-input"
              value={pseudo}
              // L'arobase est déjà affichée à gauche : la retaper ferait « @@ ».
              onChange={(e) => setPseudo(e.target.value.replace(/^@+/, ''))}
              placeholder="kossi"
              autoComplete="username"
              autoFocus
              style={{
                flex: 1,
                minWidth: 0,
                height: '100%',
                border: 'none',
                background: 'transparent',
                color: Colors.textPrimary,
                fontSize: 13,
                padding: '0 12px',
                outline: 'none',
              }}
            />
          </div>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={labelStyle}>MOT DE PASSE</span>
          <input
            className="sas-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            autoComplete="current-password"
            style={fieldStyle}
          />
        </label>

        {error && (
          <div
            role="alert"
            style={{
              border: '1px solid rgba(255,99,99,.28)',
              background: Colors.danger.bg,
              borderRadius: Radius.lg,
              padding: '9px 11px',
              fontSize: 12,
              lineHeight: '18px',
              color: Colors.danger.fg,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          className="sas-btn-primary"
          disabled={pending}
          style={{
            height: 38,
            border: 'none',
            borderRadius: Radius.md,
            background: Colors.blue,
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 160ms ease',
          }}
        >
          {pending ? 'Connexion…' : 'Se connecter'}
        </button>

        <p style={{ margin: 0, fontSize: 11, lineHeight: '16px', color: Colors.text35 }}>
          Mot de passe oublié ? Un administrateur peut vous en redonner un depuis l'annuaire.
        </p>
      </form>
    </div>
  );
}
