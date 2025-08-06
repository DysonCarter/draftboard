import { getTeamColorStyle, getPositionColorStyle } from '../utils/colors';

function PlayerListCard({ player }) {
  const personalRank = player.rank || player.customRank || 1;
  const originalADP = player.originalAdpRank || player.adpRank;
  const difference = personalRank - originalADP;

  return (
    <div className="bg-zinc-900 w-full h-20 text-white rounded-lg flex items-center m-1 select-none hover:bg-zinc-800 transition-colors cursor-pointer">
      <div 
        className="w-16 h-full flex items-center justify-center text-2xl font-bold rounded-l-lg"
        style={getTeamColorStyle(player.team)}
      >
        {personalRank}
      </div>
      
      <div className="w-16 h-16 mx-3 flex-shrink-0">
        <img
          src={player.headshot}
          alt={player.longName}
          draggable="false"
          onError={(e) => {
            e.currentTarget.src = "https://a.espncdn.com/i/headshots/nophoto.png";
          }}
          className="w-full h-full object-cover rounded"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <div className={`text-lg font-semibold ${
          player.starred ? 'text-yellow-400' : 
          player.thumbsDown ? 'text-red-400' : 
          'text-white'
        }`}>
          {player.longName}
        </div>
        <div className="text-sm text-gray-300 flex items-center gap-2">
          {player.team} • 
          <span 
            className="px-2 py-0.5 rounded text-white text-xs font-bold"
            style={getPositionColorStyle(player.position)}
          >
            {player.position}
          </span>
          {player.posRank}
        </div>
      </div>
      
      <div className="bg-zinc-950 px-4 h-full flex flex-col items-center justify-center rounded-r-lg">
        <div className="text-xs text-gray-400">ADP</div>
        <div className="text-lg font-bold">{originalADP}</div>
        <div className={`text-xs font-medium ${
          difference > 0 ? 'text-red-400' : 
          difference < 0 ? 'text-green-400' : 
          'text-gray-400'
        }`}>
          {difference > 0 ? `+${difference}` : difference}
        </div>
      </div>
    </div>
  );
}

export default PlayerListCard; 