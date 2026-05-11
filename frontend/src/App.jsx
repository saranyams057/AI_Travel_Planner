import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ExplorePage from './pages/ExplorePage'
import PlanPage from './pages/PlanPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/plan" element={<PlanPage />} />
      </Routes>
    </Router>
  )
}

export default App
