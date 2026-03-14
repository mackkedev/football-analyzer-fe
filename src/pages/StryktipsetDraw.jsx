import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getStryktipsetDraw } from '../services/api';
import { DrawCoupon } from './Stryktipset';
import './Stryktipset.css';

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

export default function StryktipsetDraw() {
  const { drawNumber } = useParams();
  const [draw, setDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDraw(await getStryktipsetDraw(drawNumber));
    } catch (err) {
      setError(
        err.response?.status === 404
          ? `Draw #${drawNumber} not found.`
          : 'Failed to load draw.'
      );
    } finally {
      setLoading(false);
    }
  }, [drawNumber]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="container">
      <div className="draw-detail-back">
        <Link to="/stryktipset/history" className="btn-back">
          <ArrowLeft size={14} />
          History
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
