import './App.css'
import PlayerCard from './components/PlayerCard'
import PlayerListCard from './components/PlayerListCard'

function App() {
  const MOCK_JSON = {
    "posADP": "WR10",
    "overallADP": "18.2",
    "playerID": "4047646",
    "longName": "A.J. Brown",
    "adpRank": 16,
    "position": "WR",
    "posRank": 10,
    "team": "PHI",
    "headshot": "https://a.espncdn.com/i/headshots/nfl/players/full/4047646.png"
  }
    
  return (
    <> 
      <PlayerCard player={MOCK_JSON}/>
      <PlayerListCard player={MOCK_JSON}/>
    </>
  )
}

export default App
