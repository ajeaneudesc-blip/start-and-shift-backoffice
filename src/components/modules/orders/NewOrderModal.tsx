import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiErrorCode, errorMessage } from '@/api/client';
import { createOrder } from '@/api/orders';
import { listUsers, type UserRow } from '@/api/users';
import ErrorBox from '@/components/ui/ErrorBox';
import { Colors, Radius } from '@/theme/tokens';

const SEARCH_DEBOUNCE_MS = 300;
// Seul produit réel du catalogue actuel (frontend/src/constants/offers.ts) :
// pré-rempli pour le cas courant, mais modifiable — le seed historique montre
// des commandes sur d'autres packs (Menu, Affiche…).
const DEFAULT_PACK = 'Pack identité';
const DEFAULT_AMOUNT = 18000;

const MESSAGES: Record<string, string> = {
  invalid_userId: 'Sélectionnez un client.',
  pack_required: 'Indiquez le pack.',
  invalid_amount: 'Montant invalide.',
  user_not_found: 'Client introuvable.',
  ref_generation_failed: 'Réessayez, la génération de référence a échoué.',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Le paiement est confirmé hors app (espèces, T-Money, Flooz) avant que le
 * backoffice n'ouvre la commande : ce formulaire n'a donc rien à voir avec un
 * paiement, seulement en enregistrer un déjà reçu.
 */
export default function NewOrderModal({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [client, setClient] = useState<UserRow | null>(null);
  const [pack, setPack] = useState(DEFAULT_PACK);
  const [amount, setAmount] = useState(String(DEFAULT_AMOUNT));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const create = useMutation({
    mutationFn: () => createOrder({ userId: client!.id, pack: pack.trim(), amountFCFA: Number(amount) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      onClose();
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Formulaire vierge à chaque ouverture.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setDebouncedQuery('');
    setClient(null);
    setPack(DEFAULT_PACK);
    setAmount(String(DEFAULT_AMOUNT));
    // `create` volontairement hors dépendances : sa référence change à chaque
    // rendu (objet de mutation TanStack Query), l'y ajouter réinitialiserait
    // le formulaire à chaque frappe pendant que la modale reste ouverte.
    create.reset();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const results = useQuery({
    queryKey: ['orders-new-client-search', debouncedQuery],
    queryFn: () => listUsers({ q: debouncedQuery, role: 'CLIENT' }),
    enabled: open && client === null && debouncedQuery.trim().length > 0,
  });

  const amountNumber = Number(amount);
  const canSubmit =
    client !== null && pack.trim().length > 0 && Number.isFinite(amountNumber) && amountNumber > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    create.mutate();
  }

  const errorText = create.isError
    ? MESSAGES[apiErrorCode(create.error) ?? ''] || errorMessage(create.error)
    : null;

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    height: 34,
    border: '1px solid rgba(255,255,255,.11)',
    borderRadius: Radius.md,
    background: Colors.bg,
    color: Colors.textPrimary,
    fontSize: 13,
    padding: '0 10px',
    outline: 'none',
  };

  return (
    <dialog
      ref={dialogRef}
      className="sas-dialog"
      onClose={onClose}
      style={{
        border: `1px solid ${Colors.border}`,
        borderRadius: Radius.lg,
        background: Colors.surface,
        color: Colors.textPrimary,
        padding: 0,
        width: 380,
        maxWidth: '92vw',
      }}
    >
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Nouvelle commande</h2>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: Colors.text50 }}>
          Client
          {client ? (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                ...fieldStyle,
              }}
            >
              <span style={{ color: '#fff', fontSize: 13 }}>
                {client.name} <span style={{ color: Colors.text40 }}>{client.handle}</span>
              </span>
              <button
                type="button"
                onClick={() => setClient(null)}
                className="sas-btn-ghost"
                style={{ border: 'none', background: 'transparent', color: Colors.text50, cursor: 'pointer' }}
              >
                ×
              </button>
            </span>
          ) : (
            <>
              <input
                className="sas-input"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom, raison sociale ou @pseudo"
                style={fieldStyle}
              />
              {debouncedQuery.trim().length > 0 && (
                <div
                  style={{
                    maxHeight: 160,
                    overflowY: 'auto',
                    border: `1px solid ${Colors.border}`,
                    borderRadius: Radius.md,
                  }}
                >
                  {results.isPending ? (
                    <p style={{ margin: 0, padding: 10, fontSize: 12, color: Colors.text45 }}>Recherche…</p>
                  ) : results.data?.items.length ? (
                    results.data.items.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setClient(u)}
                        className="sas-row"
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          border: 'none',
                          background: 'transparent',
                          color: '#fff',
                          padding: '8px 10px',
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        {u.name} <span style={{ color: Colors.text40, fontSize: 12 }}>{u.handle}</span>
                      </button>
                    ))
                  ) : (
                    <p style={{ margin: 0, padding: 10, fontSize: 12, color: Colors.text45 }}>Aucun client.</p>
                  )}
                </div>
              )}
            </>
          )}
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: Colors.text50 }}>
          Pack
          <input className="sas-input" value={pack} onChange={(e) => setPack(e.target.value)} style={fieldStyle} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: Colors.text50 }}>
          Montant (FCFA)
          <input
            className="sas-input"
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={fieldStyle}
          />
        </label>

        {errorText && <ErrorBox message={errorText} />}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            className="sas-btn-ghost"
            style={{
              height: 34,
              padding: '0 14px',
              border: `1px solid ${Colors.borderMid}`,
              borderRadius: Radius.md,
              background: 'transparent',
              color: Colors.text85,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!canSubmit || create.isPending}
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
              cursor: !canSubmit || create.isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {create.isPending ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
