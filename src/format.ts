/**
 * `toLocaleString('fr-FR')` sépare les milliers par une espace fine insécable
 * (U+202F) qu'Inter Tight rend quasi nulle : « 1 301 » se lit « 1301 ». On la
 * ramène à une espace ordinaire, comme le fait `services/format.ts` côté API.
 * Le passage ici reste utile : la route overview laisse encore filer le cas
 * du KPI « Inscrits ».
 */
export function normalizeSpaces(text: string): string {
  return text.replace(/[  ]/g, ' ');
}

/** Entier formaté à la française : « 1 301 ». */
export function formatCount(n: number): string {
  return normalizeSpaces(n.toLocaleString('fr-FR'));
}

const pad = (n: number) => String(n).padStart(2, '0');

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Portage de `formatTime()` de l'API : aujourd'hui « HH:mm », hier « Hier »,
 * au-delà « JJ/MM ». Les messages poussés par le WebSocket arrivent bruts,
 * sans le champ `time` que la route REST ajoute ; c'est ici qu'on le refait.
 */
export function formatTime(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  if (sameDay(d, now)) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return 'Hier';

  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}
