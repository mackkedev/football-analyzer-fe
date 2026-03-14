import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, TrendingUp } from 'lucide-react';
import { getStryktipsetHistory } from '../services/api';
import './Stryktipset.css';

function formatCloseDate(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = n => String(n).padStart(2, '0');
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function calcAccuracy(draw) {
  const events = draw.events || [];
  const played = events.filter(e => e.actualResult != null);
  if (played.length < 13) return null;
  const correct = played.filter(
    e => e.aiPrediction != null && e.actualResult === e.aiPrediction
  ).length;
  return { correct, total: 13 };
}

function accuracyChipClass(acc) {
  if (!acc) return 'acc-none';
  const ratio = acc.correct / acc.total;
  if (ratio >= 0.6) return 'acc-good';
  if (ratio >= 0.4) return 'acc-mid';
  return 'acc-low';
}

function LoadingSkeleton() {
  return (
    <div className="history-list">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: 68,
            borderRadius: 'var(--radius-lg)',
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function StryktipsetHistory() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDraws(await getStryktipsetHistory());
    } catch (err) {
      setError('Failed to load history. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="container">
      <div className="history-hero">
        <div className="history-hero-inner">
          <div>
            <h1 className="history-title">
              <TrendingUp size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Draw History
            </h1>
            <p className="history-subtitle">All Stryktipset draws with AI prediction accuracy</p>
          </div>
          <Link to="/stryktipset" className="btn-back">
            Current Draw
          </Link>
        </div>
      </div>

      {loading && <LoadingSkeleton />}

      {error && (
        <div className="coupon-error">
          <p>{error}</p>
          <button className="btn-retry" onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && draws.length === 0 && (
        <div className="history-empty">No draws available yet.</div>
      )}

      {!loading && !error && draws.length > 0 && (
        <div className="history-list">
          {draws.map(draw => {
            const acc = calcAccuracy(draw);
            const isOpen = draw.drawState === 'Open';
            return (
              <Link
                key={draw.id}
                to={`/stryktipset/draw/${draw.drawNumber}`}
                className="history-card card"
              >
                <div className="history-draw-info">
                  <div className="history-draw-number">Omgång {draw.drawNumber}</div>
                  <div className="history-draw-label">Draw #{draw.drawNumber}</div>
                </div>

                <div className="history-draw-date">
                  <Clock size={13} />
                  {formatCloseDate(draw.regCloseTime)}
                </div>

                <span className={`draw-state-badge ${isOpen ? 'state-open' : 'state-finalized'}`}>
                  {draw.drawState}
                </span>

                <div className="history-accuracy">
                  {acc != null ? (
                    <span className={`accuracy-chip ${accuracyChipClass(acc)}`}>
                      {acc.correct} / {acc.total} correct
                    </span>
                  ) : (
                    <span className="accuracy-chip acc-none">In progress</span>
                  )}
                </div>

                <ChevronRight size={16} className="history-chevron" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
