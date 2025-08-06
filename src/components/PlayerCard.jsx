import { getTeamColorStyle, getPositionColorStyle } from '../utils/colors';

function PlayerCard({ player }) {
  return (
    <div className="bg-zinc-900 w-100 text-white rounded-lg text-xl flex flex-col m-2 select-none">
      <div 
        className="p-3 w-100 text-3xl rounded-t-lg text-center" 
        style={getTeamColorStyle(player.team)}
      >
        <h2>{player.longName.toUpperCase()}</h2>
      </div>
      <div className="w-full h-72 overflow-hidden">
        <img
          src={player.headshot}
          alt={player.longName}
          draggable="false"
          onError={(e) => {
            e.currentTarget.src = "https://a.espncdn.com/i/headshots/nophoto.png";
          }}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-zinc-950 flex-1 rounded-b-lg p-4 h-auto">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-xs text-gray-400">TEAM</div>
            <div className="text-lg font-bold">{player.team}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">RANK</div>
            <div className="text-lg">#{player.rank || player.adpRank}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">POS</div>
            <div className="text-lg relative">
              <span 
                className="font-bold text-white px-1 rounded text-sm"
                style={getPositionColorStyle(player.position)}
              >
                {player.position}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">POS RANK</div>
            <div className="text-lg">#{player.posRank}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;
