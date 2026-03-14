import { getLeagueMeta } from '../services/constants';
import './LeagueFilter.css';

export default function LeagueFilter({ leagues, selected, onSelect }) {
  return (
    <div className="league-filter">
      <button
        className={`league-tab ${selected === null ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        <span className="league-tab-flag">⚽</span>
        <span className="league-tab-name">All Leagues</span>
      </button>

      {leagues.map((league) => {
        const meta = getLeagueMeta(league.name);
        return (
          <button
            key={league.id}
            className={`league-tab ${selected === league.id ? 'active' : ''}`}
            onClick={() => onSelect(league.id)}
            style={{ '--league-accent': meta.accent }}
          >
            <span className="league-tab-flag">{meta.flag}</span>
            <span className="league-tab-name">{league.name}</span>
            <span className="league-tab-short">{meta.short}</span>
          </button>
        );
      })}
    </div>
  );
}
