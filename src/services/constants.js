// League metadata for display
export const LEAGUE_META = {
  'Premier League': {
    short: 'PL',
    color: '#3d195b',
    accent: '#00ff85',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  },
  'Serie A': {
    short: 'SA',
    color: '#024494',
    accent: '#008fd7',
    flag: '🇮🇹',
  },
  'Bundesliga': {
    short: 'BL',
    color: '#d20515',
    accent: '#ff2b3a',
    flag: '🇩🇪',
  },
  'La Liga': {
    short: 'LL',
    color: '#ee8707',
    accent: '#ff6900',
    flag: '🇪🇸',
  },
  'Championship': {
    short: 'CH',
    color: '#1c3c6b',
    accent: '#e8a640',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  },
};

export const getLeagueMeta = (name) => {
  return LEAGUE_META[name] || { short: '??', color: '#333', accent: '#888', flag: '⚽' };
};

// Prediction labels
export const RESULT_LABELS = {
  '1': 'Home Win',
  'X': 'Draw',
  '2': 'Away Win',
  '1,X': '1 or X',
  'X,2': 'X or 2',
  '1,2': '1 or 2',
};

// Confidence color thresholds
export const getConfidenceColor = (value) => {
  if (value >= 0.7) return 'var(--accent-green)';
  if (value >= 0.5) return 'var(--accent-amber)';
  return 'var(--accent-red)';
};

export const getConfidenceBadge = (value) => {
  if (value >= 0.7) return 'badge-green';
  if (value >= 0.5) return 'badge-amber';
  return 'badge-red';
};

export const formatConfidence = (value) => {
  return `${Math.round(value * 100)}%`;
};

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};
