import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import Pokedex from './pages/Pokedex';
import TrainerProfiles from './pages/TrainerProfiles';
import TeamBuilder from './pages/TeamBuilder';
import TypeInsights from './pages/TypeInsights';
import './App.css';

const navItems = [
  { path: '/pokedex', label: 'Pokedex' },
  { path: '/trainers', label: 'Trainers' },
  { path: '/team-builder', label: 'Team Builder' },
  { path: '/types', label: 'Type Insights' },
];

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="brand brand--headline" aria-hidden="true">
          <h1>Poke-Dex Gen 1</h1>
        </div>
        <header className="app-header">
          <div className="brand">
            <span className="brand-pill">Gen I</span>
            <div>
              <p className="brand-kicker">Poke Team Lab</p>
              <h1>Pokedex Control Room</h1>
            </div>
          </div>
          <nav className="main-nav">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/pokedex" replace />} />
            <Route path="/pokedex" element={<Pokedex />} />
            <Route path="/trainers" element={<TrainerProfiles />} />
            <Route path="/team-builder" element={<TeamBuilder />} />
            <Route path="/types" element={<TypeInsights />} />
            <Route path="*" element={<Navigate to="/pokedex" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
