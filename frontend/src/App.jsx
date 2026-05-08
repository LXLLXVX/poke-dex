import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import Pokedex from './pages/Pokedex';
import TrainerProfiles from './pages/TrainerProfiles';
import TeamBuilder from './pages/TeamBuilder';
import TypeInsights from './pages/TypeInsights';
import Dashboard from './pages/Dashboard';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

const baseNavItems = [
  { path: '/pokedex', label: 'Pokedex' },
  { path: '/trainers', label: 'Trainers' },
  { path: '/team-builder', label: 'Team Builder' },
  { path: '/types', label: 'Type Insights' },
];

function App() {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          signal: controller.signal,
          credentials: 'include',
        });

        if (!response.ok) {
          setAuthUser(null);
          return;
        }

        const payload = await response.json();
        setAuthUser(payload.data?.user ?? null);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setAuthUser(null);
        }
      }
    }

    loadSession();
    return () => controller.abort();
  }, []);

  const isAdmin = authUser?.role === 'admin';
  const navItems = useMemo(() => {
    if (isAdmin) {
      return [...baseNavItems, { path: '/dashboard', label: 'Dashboard' }];
    }
    return baseNavItems;
  }, [isAdmin]);

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
            <Route path="/dashboard" element={isAdmin ? <Dashboard /> : <Navigate to="/pokedex" replace />} />
            <Route path="*" element={<Navigate to="/pokedex" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
