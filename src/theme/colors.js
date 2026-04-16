export const colors = {
  bg:            '#FFF9F2',   // warm cream
  bgAlt:         '#FEF6EC',
  card:          '#FFFFFF',
  cardAlt:       '#FDF8F0',
  text:          '#1F1B2E',   // deep plum-black
  textSecondary: '#4B4458',
  textMuted:     '#8A8496',
  primary:       '#FF6B4A',   // vibrant coral (motivating!)
  primaryDark:   '#E55A3A',
  primarySoft:   '#FFE8E1',
  accent:        '#7C3AED',   // playful purple
  accentSoft:    '#EDE9FE',
  success:       '#10B981',   // celebration green
  successSoft:   '#D1FAE5',
  warning:       '#F59E0B',
  warningSoft:   '#FEF3C7',
  danger:        '#EF4444',
  border:        '#F3EAE0',
  borderStrong:  '#E5D4C3',
  divider:       '#F7F0E6',
};

// Vibrant, harmonious category palette
export const categoryMeta = {
  'self-development': { label: 'Eneseareng',  color: '#6366F1', soft: '#E0E7FF', emoji: '📘' },
  'self-care':        { label: 'Enesehoid',   color: '#06B6D4', soft: '#CFFAFE', emoji: '🧘' },
  'movement':         { label: 'Liikumine',   color: '#F97316', soft: '#FFEDD5', emoji: '🏃' },
  'partner-activity': { label: 'Kaaslasega',  color: '#EC4899', soft: '#FCE7F3', emoji: '💞' },
  'child-activity':   { label: 'Lapsega',     color: '#F59E0B', soft: '#FEF3C7', emoji: '🧸' },
  'family-activity':  { label: 'Perega',      color: '#10B981', soft: '#D1FAE5', emoji: '🏡' },
  'healthy-eating':   { label: 'Toitumine',   color: '#84CC16', soft: '#ECFCCB', emoji: '🥗' },
};

export const categoryKeys = Object.keys(categoryMeta);

export const typography = {
  title:         { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  h1:            { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  h2:            { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  body:          { fontSize: 15, fontWeight: '400' },
  bodyStrong:    { fontSize: 15, fontWeight: '600' },
  caption:       { fontSize: 12, fontWeight: '500', letterSpacing: 0.3 },
  captionStrong: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
};

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32 };

export const shadow = {
  soft: {
    shadowColor: '#1F1B2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lifted: {
    shadowColor: '#1F1B2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};
