import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { getAccuracyOverview, getLeagues } from '../services/api';
import LeagueFilter from '../components/LeagueFilter';
import './Accuracy.css';

export default function Accuracy() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeagues().then(setLeagues).catch(console.error);
  }, []);

  useEffect(() => {
    loadAccuracy();
  }, [selectedLeague]);

  const loadAccuracy = async () => {
    setLoading(true);
    try {
      const data = await getAccuracyOverview(selectedLeague);
      setOverview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = overview ? [
    { key: 'result', label: 'Match Result', value: overview.resultAccuracy },
    { key: 'btts', label: 'BTTS', value: overview.bttsAccuracy },
    { key: 'goals2nd', label: 'More Goals 2nd Half', value: overview.moreGoals2ndHalfAccuracy },
    { key: 'shots', label: 'Most Shots on Goal', value: overview.shotsAccuracy },
    { key: 'yellowCards', label: 'Most Yellow Cards', value: overview.yellowCardsAccuracy },
    { key: 'corners', label: 'Most Corners', value: overview.cornersAccuracy },
  ].filter(cat => cat.value != null) : [];

  const getBarColor = (val) => {
    if (val >= 60) return 'var(--accent-green)';
    if (val >= 45) return 'var(--accent-amber)';
    return 'var(--accent-red)';
  };

  return (
    <div className="container">
      <div className="accuracy-hero">
        <div>
          <h1 className="accuracy-title">Prediction Accuracy</h1>
          <p className="accuracy-subtitle">How well is MatchIQ performing?</p>
        </div>
        {overview && overview.totalMatches > 0 && (
          <div className="accuracy-overall">
            <div className="overall-ring" style={{
              '--pct': `${overview.overallAccuracy || 0}`,
              '--ring-color': getBarColor(overview.overallAccuracy || 0),
            }}>
              <span className="overall-value">{Number(overview.overallAccuracy || 0).toFixed(0)}%</span>
            </div>
            <div className="overall-meta">
              <span className="overall-label">Overall</span>
              <span className="overall-matches">{overview.totalMatches} matches analyzed</span>
            </div>
          </div>
        )}
      </div>

      <div className="accuracy-filter">
        <LeagueFilter leagues={leagues} selected={selectedLeague} onSelect={setSelectedLeague} />
      </div>

      {loading && (
        <div className="skeleton" style={{ height: 300 }} />
      )}

      {!loading && overview && overview.totalMatches > 0 && (
        <div className="accuracy-bars card">
          {categories.map((cat) => (
            <div key={cat.key} className="accuracy-bar-row">
              <span className="accuracy-bar-label">{cat.label}</span>
              <div className="accuracy-bar-track">
                <div
                  className="accuracy-bar-fill"
                  style={{
                    width: `${cat.value || 0}%`,
                    background: getBarColor(cat.value || 0),
                  }}
                />
              </div>
              <span className="accuracy-bar-value" style={{ color: getBarColor(cat.value || 0) }}>
                {Number(cat.value || 0).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && (!overview || overview.totalMatches === 0) && (
        <div className="accuracy-empty card">
          <Target size={32} />
          <p>No accuracy data yet.</p>
          <p className="text-sm">Results will appear after matches are played and evaluated.</p>
        </div>
      )}
    </div>
  );
}
