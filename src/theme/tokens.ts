export const Colors = {
  // Fonds
  bg:         '#0E0E11',
  surface:    '#131317',
  header:     '#101014',
  sidebar:    '#0F0F13',

  // Marque
  blue:       '#095CFF',
  blueHover:  '#1E6BFF',
  blueMid:    '#7FA9FF',
  orange:     '#FF915E',
  orangeMid:  '#FFB894',

  // Bordures
  border:     'rgba(255,255,255,0.09)',
  borderMid:  'rgba(255,255,255,0.13)',

  // Texte
  textPrimary:'#FFFFFF',
  text85:     'rgba(255,255,255,0.85)',
  text70:     'rgba(255,255,255,0.70)',
  text50:     'rgba(255,255,255,0.50)',
  text45:     'rgba(255,255,255,0.45)',
  text40:     'rgba(255,255,255,0.40)',
  text35:     'rgba(255,255,255,0.35)',

  // Statuts — { bg, fg } pour les pastilles
  ok:         { bg: 'rgba(31,170,89,0.16)',   fg: '#6BD79A' },
  warn:       { bg: 'rgba(255,145,94,0.16)',  fg: '#FFB894' },
  info:       { bg: 'rgba(9,92,255,0.18)',    fg: '#7FA9FF' },
  muted:      { bg: 'rgba(255,255,255,0.07)', fg: 'rgba(255,255,255,0.5)' },
  danger:     { bg: 'rgba(255,99,99,0.14)',   fg: '#FF8A8A' },
} as const;

export const Font = {
  family: "'Inter Tight', system-ui, sans-serif",
};

export const Radius = { sm: 6, md: 8, lg: 10, xl: 12 } as const;

/** Gabarits repris du prototype : hauteurs fixes du Shell. */
export const Layout = {
  headerHeight: 56,
  sidebarWidth: 220,
} as const;
