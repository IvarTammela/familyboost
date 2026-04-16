export const colors = {
  bg:          '#F4F5F7',
  card:        '#FFFFFF',
  cardAlt:     '#FAFAFB',
  text:        '#111418',
  textSecondary: '#3B4048',
  textMuted:   '#6B7280',
  primary:     '#1F2937',   // deep slate
  primarySoft: '#EEF0F4',
  accent:      '#2563EB',   // professional blue
  accentSoft:  '#E0EAFF',
  success:     '#16A34A',
  successSoft: '#DCFCE7',
  warning:     '#D97706',
  danger:      '#DC2626',
  border:      '#E5E7EB',
  borderStrong:'#D1D5DB',
  divider:     '#F3F4F6',
};

// Professional category palette — muted, coherent
export const categoryMeta = {
  'self-development': { label: 'Eneseareng',  color: '#4F46E5', short: 'EA' },
  'self-care':        { label: 'Enesehoid',   color: '#0891B2', short: 'EH' },
  'movement':         { label: 'Liikumine',   color: '#EA580C', short: 'LI' },
  'partner-activity': { label: 'Kaaslasega',  color: '#BE185D', short: 'KA' },
  'child-activity':   { label: 'Lapsega',     color: '#CA8A04', short: 'LA' },
  'family-activity':  { label: 'Perega',      color: '#059669', short: 'PE' },
  'healthy-eating':   { label: 'Toitumine',   color: '#65A30D', short: 'TO' },
};

export const categoryKeys = Object.keys(categoryMeta);

export const typography = {
  title:      { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  h1:         { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  h2:         { fontSize: 17, fontWeight: '600', letterSpacing: -0.2 },
  body:       { fontSize: 15, fontWeight: '400' },
  bodyStrong: { fontSize: 15, fontWeight: '600' },
  caption:    { fontSize: 12, fontWeight: '500', letterSpacing: 0.3 },
  captionStrong: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32 };
