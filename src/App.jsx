import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import DraftBoardManager from './components/DraftBoardManager'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/pre-draft" replace />} />
        <Route path="/pre-draft" element={<DraftBoardManager mode="pre-draft" />} />
        <Route path="/during-draft" element={<DraftBoardManager mode="during-draft" />} />
      </Routes>
    </Router>
  )
}

export default App
