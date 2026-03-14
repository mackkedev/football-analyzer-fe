import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, CornerDownRight } from 'lucide-react';
import { getMatch, getMatchAnalysis } from '../services/api';
import {
  RESULT_LABELS, formatConfidence, getConfidenceColor,
  formatDate, formatTime, getLeagueMeta
} from '../services/constants';
import './MatchDetail.css';

export default function MatchDetail() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [matchId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchData, analysisData] = await Promise.all([
        getMatch(matchId),
        getMatchAnalysis(matchId).catch(() => null),
      ]);
      setMatch(matchData);
      setAnalysis(analysisData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container">
        <p>Match not found.</p>
      </div>
    );
  }

  const meta = getLeagueMeta(match.league?.name);
  const result = match.result;
  const isFinished = match.status === 'FINISHED';

  return (
    <div className="container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Back to Weekend
      </button>

      {/* Match header */}
      <div className="detail-header card">
        <div className="detail-league-bar">
          <span>{meta.flag} {match.league?.name}</span>
          <span>{formatDate(match.kickoffTime)} • {formatTime(match.kickoffTime)}</span>
          {match.gameweekRound && <span>Gameweek {match.gameweekRound}</span>}
        </div>

        <div className="detail-teams">
          <div className="detail-team home">
            {match.homeTeam.logoUrl && (
              <img src={match.homeTeam.logoUrl} alt="" className="detail-team-logo" />
            )}
            <span className="detail-team-name">{match.homeTeam.name}</span>
          </div>

          <div className="detail-score-center">
            {isFinished && result ? (
              <>
                <div className="detail-score">
                  <span>{result.homeGoalsTotal}</span>
                  <span className="detail-score-sep">–</span>
                  <span>{result.awayGoalsTotal}</span>
                </div>
                <span className="detail-ht">
                  HT: {result.homeGoals1stHalf}-{result.awayGoals1stHalf}
                </span>
              </>
            ) : (
              <span className="detail-vs">VS</span>
            )}
          </div>

          <div className="detail-team away">
            <span className="detail-team-name">{match.awayTeam.name}</span>
            {match.awayTeam.logoUrl && (
              <img src={match.awayTeam.logoUrl} alt="" className="detail-team-logo" />
            )}
          </div>
        </div>

        {/* Result stats bar */}
        {isFinished && result && (
          <div className="detail-stats-bar">
            <StatItem label="Corners" home={result.homeCorners} away={result.awayCorners} />
            <StatItem label="Yellow Cards" home={result.homeYellowCards} away={result.awayYellowCards} />
            <StatItem label="Red Cards" home={result.homeRedCards} away={result.awayRedCards} />
            <StatItem label="BTTS" value={result.btts ? 'Yes' : 'No'} />
            <StatItem label="Total Goals" value={result.goalsTotal} />
            <StatItem label="More 2nd Half" value={result.moreGoals2ndHalf ? 'Yes' : 'No'} />
          </div>
        )}
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="detail-analysis">
          <div className="analysis-header">
            <Brain size={20} />
            <h2>AI Analysis</h2>
            <span className="analysis-model">{analysis.modelUsed}</span>
          </div>

          <div className="analysis-grid">
            <AnalysisBlock
              title="Match Result"
              prediction={RESULT_LABELS[analysis.resultPrediction] || analysis.resultPrediction}
              confidence={analysis.resultConfidence}
              actual={isFinished && result ? RESULT_LABELS[result.fullTimeResult] : null}
              correct={isFinished && result ? (
                analysis.resultPrediction.includes(',')
                  ? analysis.resultPrediction.split(',').includes(result.fullTimeResult)
                  : analysis.resultPrediction === result.fullTimeResult
              ) : null}
            />
            <AnalysisBlock
              title="Both Teams to Score"
              prediction={analysis.bttsPrediction ? 'Yes' : 'No'}
              confidence={analysis.bttsConfidence}
              actual={isFinished && result ? (result.btts ? 'Yes' : 'No') : null}
              correct={isFinished && result ? analysis.bttsPrediction === result.btts : null}
            />
            <AnalysisBlock
              title="More Goals 2nd Half"
              prediction={analysis.moreGoals2ndHalfPrediction ? 'Yes' : 'No'}
              confidence={analysis.moreGoals2ndHalfConfidence}
              actual={isFinished && result?.moreGoals2ndHalf != null ? (result.moreGoals2ndHalf ? 'Yes' : 'No') : null}
              correct={isFinished && result?.moreGoals2ndHalf != null ? analysis.moreGoals2ndHalfPrediction === result.moreGoals2ndHalf : null}
            />
            <AnalysisBlock
              title="Most Shots on Goal"
              prediction={analysis.mostShotsOnGoal}
              confidence={null}
              actual={null}
            />
            <AnalysisBlock
              title="Most Yellow Cards"
              prediction={analysis.mostYellowCards}
              confidence={null}
              actual={isFinished && result?.homeYellowCards != null ? (
                result.homeYellowCards > result.awayYellowCards ? 'HOME'
                  : result.awayYellowCards > result.homeYellowCards ? 'AWAY'
                  : 'EQUAL'
              ) : null}
              correct={isFinished && result?.homeYellowCards != null ? (
                result.homeYellowCards !== result.awayYellowCards &&
                analysis.mostYellowCards === (result.homeYellowCards > result.awayYellowCards ? 'HOME' : 'AWAY')
              ) : null}
            />
            <AnalysisBlock
              title="Most Corners"
              prediction={analysis.mostCorners}
              confidence={null}
              actual={isFinished && result?.homeCorners != null ? (
                result.homeCorners > result.awayCorners ? 'HOME'
                  : result.awayCorners > result.homeCorners ? 'AWAY'
                  : 'EQUAL'
              ) : null}
              correct={isFinished && result?.homeCorners != null ? (
                result.homeCorners !== result.awayCorners &&
                analysis.mostCorners === (result.homeCorners > result.awayCorners ? 'HOME' : 'AWAY')
              ) : null}
            />
          </div>

          {/* Reasoning */}
          {analysis.reasoning && (
            <div className="analysis-reasoning card">
              <h3><CornerDownRight size={16} /> AI Reasoning</h3>
              <div className="reasoning-text">
                {analysis.reasoning.split('\n\n').map((block, i) => {
                  const m = block.match(/^([A-Z][A-Z\s0-9]+):\s*([\s\S]*)/);
                  if (m) {
                    return (
                      <p key={i}>
                        <strong className="reasoning-section">{m[1]}:</strong>{' '}{m[2]}
                      </p>
                    );
                  }
                  return <p key={i}>{block}</p>;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!analysis && (
        <div className="no-analysis-detail card">
          <Brain size={24} />
          <p>No analysis generated yet for this match.</p>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, home, away, value }) {
  return (
    <div className="stat-item">
      <span className="stat-label">{label}</span>
      {value != null ? (
        <span className="stat-value">{String(value)}</span>
      ) : (
        <span className="stat-value">{home ?? '-'} – {away ?? '-'}</span>
      )}
    </div>
  );
}

function AnalysisBlock({ title, prediction, confidence, actual, correct }) {
  return (
    <div className={`analysis-block card ${correct === true ? 'correct' : correct === false ? 'incorrect' : ''}`}>
      <div className="analysis-block-header">
        <span className="analysis-block-title">{title}</span>
        {correct === true && <span className="badge badge-green">✓ Correct</span>}
        {correct === false && <span className="badge badge-red">✗ Wrong</span>}
      </div>
      <div className="analysis-block-prediction">{prediction}</div>
      {confidence != null && (
        <div className="analysis-block-conf">
          <div className="confidence-bar">
            <div
              className="confidence-bar-fill"
              style={{
                width: `${Math.round(confidence * 100)}%`,
                background: getConfidenceColor(confidence),
              }}
            />
          </div>
          <span className="conf-label" style={{ color: getConfidenceColor(confidence) }}>
            {formatConfidence(confidence)}
          </span>
        </div>
      )}
      {actual != null && (
        <div className="analysis-block-actual">
          Actual: <strong>{actual}</strong>
        </div>
      )}
    </div>
  );
}
