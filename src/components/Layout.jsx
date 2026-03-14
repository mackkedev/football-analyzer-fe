import { Outlet, NavLink } from 'react-router-dom';
import { BarChart3, Target, Settings, Zap, Ticket } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <div className="container header-inner">
          <NavLink to="/" className="logo">
            <div className="logo-mark">
              <Zap size={20} />
            </div>
            <div className="logo-text">
              <span className="logo-name">MatchIQ</span>
              <span className="logo-tagline">AI Match Analyzer</span>
            </div>
          </NavLink>

          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={16} />
              <span>Weekend</span>
            </NavLink>
            <NavLink to="/accuracy" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Target size={16} />
              <span>Accuracy</span>
            </NavLink>
            <NavLink to="/stryktipset" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Ticket size={16} />
              <span>Stryktipset</span>
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Settings size={16} />
              <span>Admin</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <p>MatchIQ — AI-powered football analysis • Premier League • Serie A • Bundesliga • La Liga • Championship</p>
        </div>
      </footer>
    </div>
  );
}
