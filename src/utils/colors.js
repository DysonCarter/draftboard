export const teamColors = {
  'PHI': '#004C54',
  'KC': '#E31837',
  'BUF': '#00338D',
  'DAL': '#003594',
  'SF': '#AA0000',
  'MIA': '#008E97',
  'CIN': '#FB4F14',
  'LAC': '#0080C6',
  'BAL': '#241773',
  'NYJ': '#125740',
  'MIN': '#4F2683',
  'LAR': '#003594',
  'DET': '#0076B6',
  'JAX': '#136677',
  'ATL': '#A71930',
  'TB': '#D50A0A',
  'SEA': '#002244',
  'GB': '#203731',
  'TEN': '#0C2340',
  'LV': '#000000',
  'DEN': '#FB4F14',
  'CLE': '#311D00',
  'IND': '#002C5F',
  'HOU': '#03202F',
  'PIT': '#FFB612',
  'NE': '#002244',
  'NO': '#D3BC8D',
  'CAR': '#0085CA',
  'ARI': '#97233F',
  'CHI': '#0B162A',
  'NYG': '#0B2265',
  'WSH': '#7C1415'
};

export const positionColors = {
  'QB': '#DC2626',
  'RB': '#16A34A',
  'WR': '#2563EB',
  'TE': '#D97706',
  'K': '#7C3AED',
  'DST': '#6B7280'
};

export const getTeamColor = (team) => teamColors[team] || '#6B7280';
export const getPositionColor = (position) => positionColors[position] || '#6B7280';

export const getTeamColorStyle = (team) => ({
  backgroundColor: getTeamColor(team)
});

export const getPositionColorStyle = (position) => ({
  backgroundColor: getPositionColor(position)
});

export const getPositionTextColorStyle = (position) => ({
  color: getPositionColor(position)
});

export const getPositionBorderStyle = (position) => ({
  borderColor: getPositionColor(position),
  borderWidth: '2px',
  borderStyle: 'solid'
});

export const getTeamColorClass = (team) => {
  const fallbackColors = {
    'PHI': 'bg-green-600',
    'KC': 'bg-red-600',
    'BUF': 'bg-blue-600',
    'DAL': 'bg-blue-500',
    'SF': 'bg-red-500',
    'MIA': 'bg-teal-500',
    'CIN': 'bg-orange-600',
    'LAC': 'bg-blue-400',
    'BAL': 'bg-purple-600',
    'NYJ': 'bg-green-500',
    'MIN': 'bg-purple-500',
    'LAR': 'bg-blue-700',
    'DET': 'bg-blue-600',
    'JAX': 'bg-teal-600',
    'ATL': 'bg-red-700',
    'TB': 'bg-red-600',
    'SEA': 'bg-green-700',
    'GB': 'bg-green-600',
    'TEN': 'bg-blue-500',
    'LV': 'bg-gray-800',
    'DEN': 'bg-orange-500',
    'CLE': 'bg-orange-700',
    'IND': 'bg-blue-500',
    'HOU': 'bg-red-800',
    'PIT': 'bg-yellow-500',
    'NE': 'bg-blue-800',
    'NO': 'bg-yellow-600',
    'CAR': 'bg-blue-400',
    'ARI': 'bg-red-600',
    'CHI': 'bg-blue-900',
    'NYG': 'bg-blue-700',
    'WAS': 'bg-red-900'
  };
  return fallbackColors[team] || 'bg-gray-600';
};