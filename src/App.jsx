import './App.css'
import PlayerCard from './components/PlayerCard'
import PlayerListCard from './components/PlayerListCard'

function App() {
  const MOCK_JSON = [{
    "posADP": "DST22",
    "overallADP": "266.5",
    "teamAbv": "NO",
    "teamID": "23",
    "longName": "New Orleans Saints DST",
    "adpRank": 290,
    "position": "DST",
    "posRank": 22,
    "team": "NO",
    "playerID": "DST_23",
    "headshot": "https://a.espncdn.com/i/teamlogos/nfl/500/NO.png"
  },{
    "posADP": "QB37",
    "overallADP": "318.3",
    "playerID": "4432762",
    "longName": "Shedeur Sanders",
    "adpRank": 381,
    "position": "QB",
    "posRank": 37,
    "team": "CLE",
    "headshot": "https://a.espncdn.com/i/headshots/nfl/players/full/4432762.png"
  },{
    "posADP": "WR1",
    "overallADP": "1.1",
    "playerID": "4362628",
    "longName": "Ja'Marr Chase",
    "adpRank": 1,
    "position": "WR",
    "posRank": 1,
    "team": "CIN",
    "headshot": "https://a.espncdn.com/i/headshots/nfl/players/full/4362628.png"
  },
  {
    "posADP": "RB1",
    "overallADP": "3.0",
    "playerID": "4430807",
    "longName": "Bijan Robinson",
    "adpRank": 2,
    "position": "RB",
    "posRank": 1,
    "team": "ATL",
    "headshot": "https://a.espncdn.com/i/headshots/nfl/players/full/4430807.png"
  },
  {
    "posADP": "WR2",
    "overallADP": "3.9",
    "playerID": "4262921",
    "longName": "Justin Jefferson",
    "adpRank": 3,
    "position": "WR",
    "posRank": 2,
    "team": "MIN",
    "headshot": "https://a.espncdn.com/i/headshots/nfl/players/full/4262921.png"
  },
  {
    "posADP": "WR3",
    "overallADP": "3.9",
    "playerID": "4241389",
    "longName": "CeeDee Lamb",
    "adpRank": 4,
    "position": "WR",
    "posRank": 3,
    "team": "DAL",
    "headshot": "https://a.espncdn.com/i/headshots/nfl/players/full/4241389.png"
  },
  {
    "posADP": "RB2",
    "overallADP": "6.1",
    "playerID": "4429795",
    "longName": "Jahmyr Gibbs",
    "adpRank": 5,
    "position": "RB",
    "posRank": 2,
    "team": "DET",
    "headshot": "https://a.espncdn.com/i/headshots/nfl/players/full/4429795.png"
  },
  {
    "posADP": "WR4",
    "overallADP": "7.4",
    "playerID": "4595348",
    "longName": "Malik Nabers",
    "adpRank": 6,
    "position": "WR",
    "posRank": 4,
    "team": "NYG",
    "headshot": "https://a.espncdn.com/i/headshots/nfl/players/full/4595348.png"
  },
  {
    "posADP": "WR5",
    "overallADP": "7.7",
    "playerID": "4426515",
    "longName": "Puka Nacua",
    "adpRank": 7,
    "position": "WR",
    "posRank": 5,
    "team": "LAR",
    "headshot": "https://a.espncdn.com/i/headshots/nfl/players/full/4426515.png"
  }]
    
  return (
    <> 
    {MOCK_JSON.map((player) => (
      <>
        <PlayerCard player={player}/>
        <PlayerListCard player={player}/>
      </>
    ))}
    </>
  )
}

export default App
