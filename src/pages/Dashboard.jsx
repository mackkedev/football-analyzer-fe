import { useState, useEffect } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { getWeekendMatches, getLeagues } from '../services/api';
import { getLeagueMeta, formatDate } from '../services/constants';
import LeagueFilter from '../components/LeagueFilter';
import MatchCard from '../components/MatchCard';
import './Dashboard.css';

export default function Dashboard() {
  const [leagues, setLeagues] = useState([]);
  const [weekendData, setWeekendData] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    loadMatches();
  }, [selectedLeague]);

  const loadLeagues = async () => {
    try {
      const data = await getLeagues();
      setLeagues(data);
    } catch (err) {
      console.error('Failed to load leagues', err);
    }
  };

  const loadMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeekendMatches(selectedLeague);
      setWeekendData(data);
    } catch (err) {
      setError('Failed to load matches. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalMatches = weekendData?.leagueMatches?.reduce(
    (sum, lg) => sum + (lg.matches?.length || 0), 0
  ) || 0;

  return (
    <div className="container">
      {/* Hero header */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-text">
          <h1 className="dashboard-title">Weekend Analysis</h1>
          <p className="dashboard-subtitle">
            AI-powered match predictions across Europe's top leagues
          </p>
        </div>
        {weekendData && (
          <div className="dashboard-meta">
            <div className="meta-pill">
              <Calendar size={14} />
              <span>{weekendData.weekendLabel}</span>
            </div>
            <div className="meta-pill">
              <span className="meta-count">{totalMatches}</span>
              <span>matches</span>
            </div>
          </div>
        )}
      </div>

      {/* League filter */}
      <div className="dashboard-filter">
        <LeagueFilter
          leagues={leagues}
          selected={selectedLeague}
          onSelect={setSelectedLeague}
        />
      </div>

      {/* Content */}
      {loading && (
        <div className="dashboard-loading">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 200, marginBottom: 16 }} />
          ))}
        </div>
      )}

      {error && (
        <div className="dashboard-error">
          <p>{error}</p>
          <button className="btn-retry" onClick={loadMatches}>
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {!loading && !error && weekendData && (
        <div className="dashboard-leagues">
          {weekendData.leagueMatches?.length === 0 && (
            <div className="dashboard-empty">
              <p>No matches found for this weekend.</p>
              <p className="text-muted">Try syncing fixtures from the Admin panel.</p>
            </div>
          )}

          {weekendData.leagueMatches?.map((leagueGroup) => {
            const meta = getLeagueMeta(leagueGroup.league.name);
            return (
              <section key={leagueGroup.league.id} className="league-section">
                <div className="league-section-header">
                  <div className="league-section-title">
                    <span className="league-flag">{meta.flag}</span>
                    <h2>{leagueGroup.league.name}</h2>
                    {leagueGroup.gameweekRound && (
                      <span className="gameweek-badge">GW {leagueGroup.gameweekRound}</span>
                    )}
                  </div>
                  <span className="league-match-count">
                    {leagueGroup.matches.length} matches
                  </span>
                </div>

                <div className="matches-grid">
                  {leagueGroup.matches.map((match, idx) => (
                    <div key={match.id} style={{ animationDelay: `${idx * 0.05}s` }}>
                      <MatchCard match={match} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
