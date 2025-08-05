function PlayerCard({ player }) {
  return (
    <div>
      <h2>{player.longName}</h2>
      <img
        src={player.headshot}
        alt={player.longName}
        onError={(e) => {
          e.currentTarget.src = "https://a.espncdn.com/i/headshots/nophoto.png";
        }}
      ></img>
      <h3>{player.team}</h3>
      <h3>{player.position}</h3>
    </div>
  );
}

export default PlayerCard;
