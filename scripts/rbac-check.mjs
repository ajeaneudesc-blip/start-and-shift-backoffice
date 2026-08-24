// Contrôle RBAC de bout en bout — étape 12 de BACKOFFICE_SPEC.md.
//
//   node scripts/rbac-check.mjs
//
// Le sélecteur de rôle du header ne change que l'affichage : le JWT reste celui
// du compte connecté. Ce script ouvre donc une vraie session par rôle et vérifie
// que le serveur applique la même matrice que l'écran. Aucune écriture n'aboutit :
// les cibles sont inexistantes ou les corps invalides.
//
// Il suppose l'API démarrée et la base au jeu de démonstration (`npm run db:seed`
// côté start-and-shift-api). Les numéros ci-dessous en viennent.
//
// 5 comptes × (request + dev-otp + verify + logout) = 20 appels à /api/auth :
// au-dessus des 10 requêtes/minute/IP par défaut (voir backend/src/routes/auth.ts).
// Lancer avec RATE_LIMIT_ENABLED=false côté API pour ce script, comme le fait
// la suite de tests (backend/.env.test).
const API = process.env.API_URL ?? 'http://localhost:3000';

const ACCOUNTS = {
  admin: '+22890000000',
  manager: '+22890000003',
  designer: '+22890000001',
  support: '+22890000002',
  viewer: '+22891000005',
};

const P = {
  overview:  { admin: 3, manager: 2, designer: 1, support: 1, viewer: 1 },
  conv:      { admin: 3, manager: 2, designer: 3, support: 3, viewer: 1 },
  users:     { admin: 3, manager: 2, designer: 1, support: 2, viewer: 1 },
  orders:    { admin: 3, manager: 3, designer: 2, support: 1, viewer: 1 },
  templates: { admin: 3, manager: 2, designer: 3, support: 0, viewer: 1 },
  roles:     { admin: 3, manager: 1, designer: 0, support: 0, viewer: 0 },
  audit:     { admin: 3, manager: 1, designer: 1, support: 1, viewer: 0 },
};

const READS = {
  overview: '/api/overview',
  conv: '/api/conversations',
  users: '/api/users',
  orders: '/api/orders',
  templates: '/api/templates',
  roles: '/api/roles',
  audit: '/api/audit',
};

// Écriture inoffensive par module : on ne veut que le code de retour du garde
// RBAC. Un corps invalide (400) prouve déjà qu'on a passé le contrôle d'accès.
const WRITES = {
  conv: { method: 'PATCH', path: '/api/conversations/999999', body: { status: 'RESOLUE' } },
  users: { method: 'PATCH', path: '/api/users/999999', body: { status: 'ACTIF' } },
  orders: { method: 'PATCH', path: '/api/orders/CMD-INEXISTANTE', body: { state: 'LIVRE' } },
  templates: { method: 'PATCH', path: '/api/templates/999999', body: { state: 'PUBLIE' } },
  // Niveau volontairement invalide : le garde RBAC passe en premier, la
  // validation refuse ensuite (400) sans rien écrire dans RolePermission.
  roles: { method: 'PATCH', path: '/api/roles/audit/viewer', body: { level: 9 } },
};

// Le fournisseur SMS "local" ne délivre rien : /session/dev-otp (actif
// seulement en dev, avec SMS_PROVIDER=local) est le seul moyen de récupérer le
// code sans lire les logs serveur — voir backend/src/routes/auth.ts.
async function login(phone) {
  const demande = await fetch(`${API}/api/auth/session/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  if (!demande.ok) throw new Error(`login ${phone} → demande ${demande.status}`);
  const { sessionToken } = await demande.json();

  const devOtp = await fetch(`${API}/api/auth/session/dev-otp?phone=${encodeURIComponent(phone)}`);
  const { code } = devOtp.ok ? await devOtp.json() : {};
  if (!code) throw new Error(`login ${phone} → pas de code dev-otp (SMS_PROVIDER local et NODE_ENV=development ?)`);

  const verifie = await fetch(`${API}/api/auth/session/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken, otp: code }),
  });
  if (!verifie.ok) throw new Error(`login ${phone} → verify ${verifie.status}`);
  return (await verifie.json()).token;
}

async function call(token, method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.status;
}

const failures = [];
let checks = 0;

for (const [role, phone] of Object.entries(ACCOUNTS)) {
  const token = await login(phone);

  for (const [module, path] of Object.entries(READS)) {
    const level = P[module][role];
    const status = await call(token, 'GET', path);
    // Un module masqué répond 404 : l'API ne révèle pas son existence.
    const want = level === 0 ? 404 : 200;
    checks++;
    if (status !== want) failures.push(`LECTURE ${role}/${module} (niveau ${level}) → ${status}, attendu ${want}`);
  }

  for (const [module, w] of Object.entries(WRITES)) {
    const level = P[module][role];
    const status = await call(token, w.method, w.path, w.body);
    checks++;
    // niveau 0 → 404 ; niveau 1 → 403 ; niveau ≥ 2 → le garde laisse passer et
    // c'est la cible inexistante qui répond (404 pour un id, 409 pour roles).
    const ok =
      level === 0 ? status === 404
      : level === 1 ? status === 403
      : status !== 403;
    if (!ok) failures.push(`ÉCRITURE ${role}/${module} (niveau ${level}) → ${status}`);
  }

  // On referme la session ouverte pour le test.
  await call(token, 'DELETE', '/api/auth/session');
}

console.log(JSON.stringify({ checks, ok: checks - failures.length, failures }, null, 2));

// Sortie non nulle en cas d'écart : utilisable tel quel dans un enchaînement.
if (failures.length > 0) process.exitCode = 1;
