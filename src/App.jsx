import './App.css'
import PlayerCard from './components/PlayerCard'

function App() {
  const MOCK_JSON = {
      "posADP": "QB37",
      "overallADP": "318.3",
      "playerID": "4432762",
      "longName": "Shedeur Sanders",
      "team": "CLE",
      "position": "QB",
      "headshot": "https://a.espncdn.com/i/headshots/nfl/players/full/4432762.png"
  }
    
  return (
    <PlayerCard player={MOCK_JSON}/>
  )
}

export default App
