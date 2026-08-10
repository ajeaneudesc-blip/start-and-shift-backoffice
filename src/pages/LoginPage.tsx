import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as authApi from '@/api/auth';
import { apiErrorCode, isNetworkError } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { Colors, Radius } from '@/theme/tokens';

/** Accepte « 90 12 34 56 », « 22890123456 » ou « +22890123456 ». */
function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  const local = digits.startsWith('228') ? digits.slice(3) : digits;
  return local.length === 8 ? `+228${local}` : null;
}

/** Formatage à la saisie : « 90 12 34 56 ». */
function formatLocal(input: string): string {
  const digits = input.replace(/\D/g, '');
  const local = (digits.startsWith('228') ? digits.slice(3) : digits).slice(0, 8);
  return local.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

const MESSAGES: Record<string, string> = {
  invalid_phone: 'Numéro invalide. Attendu : 8 chiffres après le +228.',
  // L'API réclame firstName/pseudo quand le numéro est inconnu : on ne les
  // envoie jamais, donc ces deux codes signifient « ce compte n'existe pas ».
  missing_firstName: "Aucun compte n'est associé à ce numéro.",
  missing_pseudo: "Aucun compte n'est associé à ce numéro.",
  account_suspended: 'Ce compte est suspendu. Contactez un administrateur.',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((s) => s.signIn);

  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;

    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError(MESSAGES.invalid_phone);
      return;
    }

    setPending(true);
    setError(null);
    try {
      const session = await authApi.login(normalized);

      // Le backoffice n'est pas ouvert aux comptes clients : la matrice les
      // ferait passer pour des « viewer » et leur ouvrirait la liste des
      // utilisateurs. On révoque la session immédiatement.
      if (session.user.role === 'CLIENT') {
        await authApi.revokeSession(session.token).catch(() => {});
        setError("Ce compte n'a pas accès au backoffice.");
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
            Connectez-vous avec le numéro de votre compte équipe.
          </p>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, letterSpacing: '.05em', color: Colors.text45 }}>
            NUMÉRO DE TÉLÉPHONE
          </span>
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
              +228
            </span>
            <input
              className="sas-input"
              value={phone}
              onChange={(e) => setPhone(formatLocal(e.target.value))}
              placeholder="90 12 34 56"
              inputMode="tel"
              autoComplete="tel-national"
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
                letterSpacing: '.04em',
              }}
            />
          </div>
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
          Pas de mot de passe : l'accès est lié au numéro enregistré sur votre compte équipe.
        </p>
      </form>
    </div>
  );
}
