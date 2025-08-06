function PlayerCard({ player }) {
  return (
    <div className="bg-zinc-900 w-100 h-120 text-white rounded-lg text-xl flex flex-col m-2 select-none">
      <div className="bg-zinc-950 p-3 w-100 text-3xl rounded-t-lg text-center"><h2>{player.longName.toUpperCase()}</h2></div>
      <img
        src={player.headshot}
        alt={player.longName}
        draggable="false"
        onError={(e) => {
          e.currentTarget.src = "https://a.espncdn.com/i/headshots/nophoto.png";
        }}
        className="w-100 h-72"
      ></img>
      <div className="bg-zinc-950 flex-1 rounded-b-lg p-7 h-auto">
        <h3>{player.team}</h3>
        <h3>{player.position}</h3>
      </div>
    </div>
  );
}

export default PlayerCard;
