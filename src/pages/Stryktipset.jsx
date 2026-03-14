import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, History, RefreshCw } from 'lucide-react';
import { getStryktipsetCurrent } from '../services/api';
import './Stryktipset.css';

// ---- Helpers ----

function formatKickoff(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = n => String(n).padStart(2, '0');
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatCloseTime(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = n => String(n).padStart(2, '0');
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function useCountdown(targetIso) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!targetIso) return;
    const target = new Date(targetIso).getTime();
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setLabel('Closed'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setLabel(`${d}d ${pad(h)}h ${pad(m)}m`);
      else if (h > 0) setLabel(`${pad(h)}h ${pad(m)}m ${pad(s)}s`);
      else setLabel(`${pad(m)}m ${pad(s)}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return label;
}

function confidenceClass(conf) {
  if (conf == null) return '';
  const p = conf * 100;
  if (p >= 70) return 'conf-high';
  if (p >= 50) return 'conf-mid';
  return 'conf-low';
}

// ---- Value rating (computed from SF data + couponSigns) ----

function getUnderdogSf(event) {
  if (!event.couponSigns || event.couponSigns.length < 2) return 100;
  const sfMap = { '1': Number(event.sf1) || 0, 'X': Number(event.sfX) || 0, '2': Number(event.sf2) || 0 };
  return Math.min(...event.couponSigns.map(s => sfMap[s]));
}

function getUnderdogSign(event) {
  if (!event.couponSigns || event.couponSigns.length < 2) return null;
  const sfMap = { '1': Number(event.sf1) || 0, 'X': Number(event.sfX) || 0, '2': Number(event.sf2) || 0 };
  return event.couponSigns.reduce((a, b) => sfMap[a] <= sfMap[b] ? a : b);
}

function getValueRating(event) {
  if (!event.couponSigns) return null;
  if (event.couponSigns.length === 1) return 'LOW';
  const underdogSf = getUnderdogSf(event);
  if (underdogSf <= 20) return 'HIGH';
  if (underdogSf <= 35) return 'MEDIUM';
  return 'LOW';
}

// ---- CouponBadge ----

function CouponBadge({ signs, actualResult }) {
  if (!signs || signs.length === 0) {
    return <span className="coupon-no-sign">—</span>;
  }

  const covered = actualResult != null && signs.includes(actualResult);
  const missed = actualResult != null && !signs.includes(actualResult);

  if (signs.length === 1) {
    return (
      <span className={`coupon-sign coupon-single${covered ? ' coupon-covered' : missed ? ' coupon-missed' : ''}`}>
        {signs[0]}
        {covered && <CheckCircle size={10} />}
        {missed && <XCircle size={10} />}
      </span>
    );
  }

  return (
    <span className={`coupon-sign coupon-halv${covered ? ' coupon-covered' : missed ? ' coupon-missed' : ''}`}>
      <span className="coupon-halv-part">{signs[0]}</span>
      <span className="coupon-halv-sep">|</span>
      <span className="coupon-halv-part">{signs[1]}</span>
      {covered && <CheckCircle size={10} />}
      {missed && <XCircle size={10} />}
    </span>
  );
}

// ---- ValueBadge ----

function ValueBadge({ rating }) {
  if (!rating || rating === 'LOW') return null;
  return (
    <span className={`value-badge ${rating === 'HIGH' ? 'value-skrall' : 'value-varde'}`}>
      {rating === 'HIGH' ? 'SKRÄLL' : 'VÄRDE'}
    </span>
  );
}

// ---- CouponSummaryBar ----

function CouponSummaryBar({ events }) {
  const all = events || [];
  const withSigns = all.filter(e => e.couponSigns != null);

  if (withSigns.length === 0) {
    return (
      <div className="coupon-summary coupon-summary-empty">
        Coupon not yet generated
      </div>
    );
  }

  const partial = withSigns.length < all.length;
  const halvCount = withSigns.filter(e => e.couponSigns.length === 2).length;
  const singleCount = withSigns.filter(e => e.couponSigns.length === 1).length;
  const rows = Math.pow(2, halvCount);
  const skrallCount = withSigns.filter(e => getValueRating(e) === 'HIGH').length;
  const vardeCount = withSigns.filter(e => getValueRating(e) === 'MEDIUM').length;

  return (
    <div className={`coupon-summary${partial ? ' coupon-summary-partial' : ''}`}>
      {partial && <span className="coupon-summary-warn">Partial</span>}
      <span className="coupon-summary-label">128kr Kupong</span>
      <span className="coupon-summary-dot">·</span>
      <span className="coupon-summary-stat">{halvCount} halvgarderingar</span>
      <span className="coupon-summary-dot">·</span>
      <span className="coupon-summary-stat">{singleCount} singlar</span>
      <span className="coupon-summary-dot">·</span>
      <span className="coupon-summary-stat">{rows} rader</span>

      {(skrallCount > 0 || vardeCount > 0) && (
        <div className="coupon-summary-values">
          {skrallCount > 0 && (
            <span className="coupon-summary-skrall">
              {skrallCount} {skrallCount === 1 ? 'skräll' : 'skrällar'}
            </span>
          )}
          {skrallCount > 0 && vardeCount > 0 && <span className="coupon-summary-dot">·</span>}
          {vardeCount > 0 && (
            <span className="coupon-summary-varde">
              {vardeCount} värdespel
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ---- CouponOverviewCard ----

function CouponOverviewCard({ events }) {
  const all = events || [];
  if (all.every(e => e.couponSigns == null)) return null;

  return (
    <div className="coupon-overview card">
      <h3 className="coupon-overview-title">Kupong — Full Översikt</h3>
      <div className="coupon-overview-list">
        {all.map(e => {
          const rating = getValueRating(e);
          return (
            <div
              key={e.eventNumber}
              className={`coupon-overview-row${e.couponSigns?.length === 2 ? ' ov-halv' : ''}`}
            >
              <span className="ov-num">#{e.eventNumber}</span>
              <span className="ov-teams">{e.homeTeam} – {e.awayTeam}</span>
              <CouponBadge signs={e.couponSigns} actualResult={e.actualResult} />
              <ValueBadge rating={rating} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- EventRow ----

function EventRow({ event }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);

  const {
    eventNumber, homeTeam, awayTeam, leagueName, kickoffTime,
    odds1, oddsX, odds2, sf1, sfX, sf2,
    aiPrediction, aiConfidence, aiReasoning,
    couponSigns, couponReasoning,
    actualResult, homeGoals, awayGoals,
  } = event;

  const hasResult = actualResult != null;
  const correct = hasResult && aiPrediction != null && actualResult === aiPrediction;
  const wrong = hasResult && aiPrediction != null && actualResult !== aiPrediction;
  const isHalv = couponSigns?.length === 2;

  const valueRating = getValueRating(event);
  const underdogSign = isHalv ? getUnderdogSign(event) : null;
  const excPct = underdogSign != null
    ? (100 - (Number({ '1': sf1, 'X': sfX, '2': sf2 }[underdogSign]) || 0))
    : null;

  // Normalise Svenska Folket to 100%
  const raw1 = Number(sf1) || 0;
  const rawX = Number(sfX) || 0;
  const raw2 = Number(sf2) || 0;
  const sfTotal = raw1 + rawX + raw2;
  const p1 = sfTotal ? Math.round((raw1 / sfTotal) * 100) : 33;
  const pX = sfTotal ? Math.round((rawX / sfTotal) * 100) : 34;
  const p2 = 100 - p1 - pX;

  const rowClass = [
    'event-row card',
    correct ? 'event-correct' : wrong ? 'event-wrong' : '',
    isHalv && !hasResult ? 'event-halv' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClass}>
      <div className="event-main">
        <div className="event-num">{eventNumber}</div>

        <div className="event-body">
          {/* Match header */}
          <div className="event-header">
            <div className="event-teams">
              <span className="team-home">{homeTeam}</span>
              <span className="event-vs">vs</span>
              <span className="team-away">{awayTeam}</span>
            </div>
            <div className="event-meta">
              <span className="league-badge">{leagueName}</span>
              <span className="kickoff-time">
                <Clock size={12} />
                {formatKickoff(kickoffTime)}
              </span>
            </div>
          </div>

          <div className="event-stats">
            {/* Odds */}
            <div className="odds-row">
              <span className="stats-label">Odds</span>
              <div className="odds-cells">
                <div className="odds-cell">
                  <span className="odds-type">1</span>
                  <span className="odds-val">{odds1 != null ? Number(odds1).toFixed(2) : '—'}</span>
                </div>
                <div className="odds-cell">
                  <span className="odds-type">X</span>
                  <span className="odds-val">{oddsX != null ? Number(oddsX).toFixed(2) : '—'}</span>
                </div>
                <div className="odds-cell">
                  <span className="odds-type">2</span>
                  <span className="odds-val">{odds2 != null ? Number(odds2).toFixed(2) : '—'}</span>
                </div>
              </div>
            </div>

            {/* Svenska Folket */}
            <div className="sf-row">
              <span className="stats-label">Public</span>
              <div className="sf-content">
                <div className="sf-bar">
                  <div className="sf-seg sf-1" style={{ width: `${p1}%` }} />
                  <div className="sf-seg sf-x" style={{ width: `${pX}%` }} />
                  <div className="sf-seg sf-2" style={{ width: `${p2}%` }} />
                </div>
                <div className="sf-labels">
                  <span className="sf-lbl sf-lbl-1">1 · {p1}%</span>
                  <span className="sf-lbl sf-lbl-x">X · {pX}%</span>
                  <span className="sf-lbl sf-lbl-2">2 · {p2}%</span>
                </div>
              </div>
            </div>

            {/* AI Prediction */}
            <div className="ai-row">
              <span className="stats-label">AI Pick</span>
              <div className="ai-content">
                {aiPrediction != null ? (
                  <span className={`ai-badge ${confidenceClass(aiConfidence)}`}>
                    <Brain size={12} />
                    {aiPrediction}{aiConfidence != null ? ` — ${Math.round(aiConfidence * 100)}%` : ''}
                  </span>
                ) : (
                  <span className="ai-pending">Pending</span>
                )}
                {aiReasoning && (
                  <button className="reasoning-toggle" onClick={() => setAiOpen(v => !v)}>
                    {aiOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {aiOpen ? 'Hide' : 'Read'} reasoning
                  </button>
                )}
              </div>
            </div>

            {aiOpen && aiReasoning && (
              <div className="reasoning-text">{aiReasoning}</div>
            )}

            {/* Coupon */}
            <div className="coupon-row">
              <span className="stats-label">Kupong</span>
              <div className="coupon-content">
                <CouponBadge signs={couponSigns} actualResult={actualResult} />
                <ValueBadge rating={valueRating} />
                {(valueRating === 'HIGH' || valueRating === 'MEDIUM') && excPct != null && (
                  <span className="coupon-exclusivity">
                    ↑ {excPct}% saknar {underdogSign}
                  </span>
                )}
                {couponReasoning && (
                  <button className="reasoning-toggle" onClick={() => setCouponOpen(v => !v)}>
                    {couponOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {couponOpen ? 'Dölj' : 'Kuponganalys'}
                  </button>
                )}
              </div>
            </div>

            {couponOpen && couponReasoning && (
              <div className="coupon-analysis-text">{couponReasoning}</div>
            )}

            {/* Result */}
            <div className="result-row">
              <span className="stats-label">Result</span>
              {hasResult ? (
                <div className="result-content">
                  <span className="result-score">{homeGoals} – {awayGoals}</span>
                  <span className={`result-badge ${correct ? 'result-correct' : 'result-wrong'}`}>
                    {actualResult}
                    {correct ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  </span>
                </div>
              ) : (
                <span className="result-pending">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- DrawCoupon — exported so StryktipsetDraw can reuse it ----

export function DrawCoupon({ draw }) {
  const isOpen = draw.drawState === 'Open';
  const countdown = useCountdown(isOpen ? draw.regCloseTime : null);
  const events = draw.events || [];

  return (
    <div className="coupon-wrap">
      <div className="coupon-header">
        <div>
          <h1 className="coupon-title">Stryktipset</h1>
          <p className="coupon-subtitle">Omgång {draw.drawNumber}</p>
        </div>
        <div className="coupon-meta">
          <span className={`draw-state-badge ${isOpen ? 'state-open' : 'state-finalized'}`}>
            {draw.drawState}
          </span>
          <div className="close-time">
            <Clock size={13} />
            {isOpen
              ? <span>Closes in {countdown}</span>
              : <span>Closed {formatCloseTime(draw.regCloseTime)}</span>
            }
          </div>
        </div>
      </div>

      <CouponSummaryBar events={events} />

      <div className="events-list">
        {events.map(e => (
          <EventRow key={e.id} event={e} />
        ))}
      </div>

      <CouponOverviewCard events={events} />
    </div>
  );
}

// ---- Loading skeleton ----

function LoadingSkeleton() {
  return (
    <div className="coupon-wrap">
      <div className="skeleton" style={{ height: 80, marginBottom: 32, borderRadius: 'var(--radius-lg)' }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="skeleton event-skeleton"
          style={{ animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}

// ---- Page ----

export default function Stryktipset() {
  const [draw, setDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDraw(await getStryktipsetCurrent());
    } catch (err) {
      setError(
        err.response?.status === 404
          ? 'No active draw available.'
          : 'Failed to load draw. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="container">
      <div className="stryk-page-top">
        <button className="btn-refresh" onClick={load} disabled={loading} title="Reload data">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh
        </button>
        <Link to="/stryktipset/history" className="btn-history">
          <History size={14} />
          Draw History
        </Link>
      </div>

      {loading && <LoadingSkeleton />}

      {error && (
        <div className="coupon-error">
          <p>{error}</p>
          <button className="btn-retry" onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && draw && <DrawCoupon draw={draw} />}
    </div>
  );
}
