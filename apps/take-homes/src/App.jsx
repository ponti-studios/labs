import { BrowserRouter, Routes, Route, Link } from 'react-router'
import Home from './pages/Home'
import Cards from './pages/Cards'
import Kensho from './pages/Kensho'
import Quilt from './pages/Quilt'
import CloudMargin from './pages/CloudMargin'
import RedBadger from './pages/RedBadger'
import GoldmanSachs from './pages/GoldmanSachs'
import GrowthStreet from './pages/GrowthStreet'
import Vendigo from './pages/Vendigo'
import PetersonAcademy from './pages/PetersonAcademy'
import InterviewCake from './pages/InterviewCake'
import Algorithms from './pages/Algorithms'
import ClickTherapeutics from './pages/ClickTherapeutics'
import ChartHop from './pages/ChartHop'
import DailyMail from './pages/DailyMail'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <h1>Take-Home Coding Tests</h1>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/cards">Cards</Link>
            <Link to="/kensho">Kensho</Link>
            <Link to="/quilt">Quilt</Link>
            <Link to="/cloudmargin">CloudMargin</Link>
            <Link to="/red-badger">Red Badger</Link>
            <Link to="/goldman-sachs">Goldman Sachs</Link>
            <Link to="/growth-street">Growth Street</Link>
            <Link to="/vendigo">Vendigo</Link>
            <Link to="/peterson-academy">Peterson Academy</Link>
            <Link to="/interview-cake">Interview Cake</Link>
            <Link to="/algorithms">Algorithms</Link>
            <Link to="/click-therapeutics">Click Therapeutics</Link>
            <Link to="/chart-hop">ChartHop</Link>
            <Link to="/daily-mail">Daily Mail</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/kensho" element={<Kensho />} />
            <Route path="/quilt" element={<Quilt />} />
            <Route path="/cloudmargin" element={<CloudMargin />} />
            <Route path="/red-badger" element={<RedBadger />} />
            <Route path="/goldman-sachs" element={<GoldmanSachs />} />
            <Route path="/growth-street" element={<GrowthStreet />} />
            <Route path="/vendigo" element={<Vendigo />} />
            <Route path="/peterson-academy" element={<PetersonAcademy />} />
            <Route path="/interview-cake" element={<InterviewCake />} />
            <Route path="/algorithms" element={<Algorithms />} />
            <Route path="/click-therapeutics" element={<ClickTherapeutics />} />
            <Route path="/chart-hop" element={<ChartHop />} />
            <Route path="/daily-mail" element={<DailyMail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}