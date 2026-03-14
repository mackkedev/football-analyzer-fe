import { useNavigate } from 'react-router-dom';
import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  getLeagueMeta, RESULT_LABELS,
  formatConfidence, getConfidenceColor, getConfidenceBadge,
  formatTime
} from '../services/constants';
import './MatchCard.css';

export default function MatchCard({ match }) {
  const navigate = useNavigate();
  const analysis = match.analysis;
  const result = match.result;
  const isFinished = match.status === 'FINISHED';

  return (
    <div className="match-card card" onClick={() => navigate(`/match/${match.id}`)}>
      {/* Top bar: time + status */}
      <div className="match-card-header">
        <span className="match-time">{formatTime(match.kickoffTime)}</span>
        {isFinished ? (
          <span className="badge badge-blue">FT</span>
        ) : (
          <span className="badge badge-green">Upcoming</span>
        )}
      </div>

      {/* Teams and score */}
      <div className="match-teams">
        <div className="team home-team">
          {match.homeTeam.logoUrl && (
            <img src={match.homeTeam.logoUrl} alt="" className="team-logo" />
          )}
          <span className="team-name">{match.homeTeam.name}</span>
        </div>

        <div className="match-score-area">
          {isFinished && result ? (
            <div className="score">
              <span className="score-num">{result.homeGoalsTotal}</span>
              <span className="score-sep">–</span>
              <span className="score-num">{result.awayGoalsTotal}</span>
            </div>
          ) : (
            <span className="vs-label">VS</span>
          )}
        </div>

        <div className="team away-team">
          <span className="team-name">{match.awayTeam.name}</span>
          {match.awayTeam.logoUrl && (
            <img src={match.awayTeam.logoUrl} alt="" className="team-logo" />
          )}
        </div>
      </div>

      {/* Analysis predictions row */}
      {analysis && (
        <div className="match-predictions">
          <PredictionPill
            label="Result"
            value={RESULT_LABELS[analysis.resultPrediction] || analysis.resultPrediction}
            confidence={analysis.resultConfidence}
          />
          <PredictionPill
            label="BTTS"
            value={analysis.bttsPrediction ? 'Yes' : 'No'}
            confidence={analysis.bttsConfidence}
          />
          <PredictionPill
            label="2nd Half"
            value={analysis.moreGoals2ndHalfPrediction ? 'More' : 'Fewer'}
            confidence={analysis.moreGoals2ndHalfConfidence}
          />
          <PredictionPill
            label="Shots"
            value={analysis.mostShotsOnGoal}
            confidence={null}
          />
          <PredictionPill
            label="Yellow Cards"
            value={analysis.mostYellowCards}
            confidence={null}
          />
          <PredictionPill
            label="Corners"
            value={analysis.mostCorners}
            confidence={null}
          />
        </div>
      )}

      {!analysis && (
        <div className="match-no-analysis">
          <span>Analysis pending...</span>
        </div>
      )}

      {/* Click hint */}
      <div className="match-card-footer">
        <span>View detailed analysis</span>
        <ChevronRight size={14} />
      </div>
    </div>
  );
}

function PredictionPill({ label, value, confidence }) {
  return (
    <div className="pred-pill">
      <span className="pred-pill-label">{label}</span>
      <span className="pred-pill-value">{value}</span>
      {confidence != null && (
        <div className="pred-pill-conf">
          <div
            className="confidence-bar-fill"
            style={{
              width: `${Math.round(confidence * 100)}%`,
              background: getConfidenceColor(confidence),
            }}
          />
        </div>
      )}
    </div>
  );
}
