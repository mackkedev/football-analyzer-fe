import { useState } from 'react';
import { Settings, Download, Brain, CheckCircle, PlayCircle, Loader2, Ticket, BarChart2 } from 'lucide-react';
import * as api from '../services/api';
import './Admin.css';

const ACTIONS = [
  {
    key: 'fixtures',
    label: 'Sync Fixtures',
    description: 'Fetch upcoming fixtures from football-data.org for all 5 leagues',
    icon: Download,
    fn: api.syncFixtures,
  },
  {
    key: 'form',
    label: 'Sync Team Form',
    description: 'Fetch league standings to populate team form, position and home/away records',
    icon: BarChart2,
    fn: api.syncForm,
  },
  {
    key: 'analysis',
    label: 'Generate Analysis',
    description: 'Run Claude AI analysis for all upcoming weekend matches',
    icon: Brain,
    fn: api.syncAnalysis,
  },
  {
    key: 'results',
    label: 'Sync Results',
    description: 'Fetch scores, stats and events for finished matches',
    icon: CheckCircle,
    fn: api.syncResults,
  },
  {
    key: 'accuracy',
    label: 'Evaluate Accuracy',
    description: 'Compare predictions against actual results',
    icon: CheckCircle,
    fn: api.syncAccuracy,
  },
  {
    key: 'all',
    label: 'Run Full Pipeline',
    description: 'Fixtures → Analysis → Results → Accuracy (all in one)',
    icon: PlayCircle,
    fn: api.syncAll,
  },
];

const STRYK_ACTIONS = [
  {
    key: 'stryk-sync',
    label: 'Sync Stryktipset',
    description: 'Fetch the current draw coupon from Svenska Spel',
    icon: Ticket,
    fn: api.syncStryktipset,
  },
  {
    key: 'stryk-predictions',
    label: 'Generate Stryktipset Predictions',
    description: 'Run Claude AI predictions on all 13 matches in the current draw',
    icon: Brain,
    fn: api.syncStryktipsetPredictions,
  },
  {
    key: 'stryk-coupon',
    label: 'Generate 128kr Coupon',
    description: 'Build the optimised 128kr system bet (7 halvgarderingar + 6 singlar)',
    icon: Ticket,
    fn: api.syncStryktipsetCoupon,
  },
];

export default function Admin() {
  const [running, setRunning] = useState({});
  const [results, setResults] = useState({});

  const handleRun = async (action) => {
    setRunning((prev) => ({ ...prev, [action.key]: true }));
    setResults((prev) => ({ ...prev, [action.key]: null }));

    try {
      const result = await action.fn();
      setResults((prev) => ({ ...prev, [action.key]: { success: true, data: result } }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [action.key]: { success: false, error: err.response?.data?.message || err.message },
      }));
    } finally {
      setRunning((prev) => ({ ...prev, [action.key]: false }));
    }
  };

  return (
    <div className="container">
      <div className="admin-hero">
        <h1 className="admin-title">Admin Panel</h1>
        <p className="admin-subtitle">Manage data sync and AI analysis pipeline</p>
      </div>

      <div className="admin-grid">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const isRunning = running[action.key];
          const result = results[action.key];

          return (
            <div key={action.key} className="admin-card card">
              <div className="admin-card-icon">
                <Icon size={22} />
              </div>
              <div className="admin-card-info">
                <h3>{action.label}</h3>
                <p>{action.description}</p>
              </div>
              <button
                className={`admin-btn ${isRunning ? 'running' : ''}`}
                onClick={() => handleRun(action)}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    Running...
                  </>
                ) : (
                  'Run'
                )}
              </button>
              {result && (
                <div className={`admin-result ${result.success ? 'success' : 'error'}`}>
                  {result.success ? (
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  ) : (
                    <span>Error: {result.error}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="admin-section-title">Stryktipset</h2>
      <div className="admin-grid" style={{ marginBottom: 32 }}>
        {STRYK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const isRunning = running[action.key];
          const result = results[action.key];

          return (
            <div key={action.key} className="admin-card card">
              <div className="admin-card-icon">
                <Icon size={22} />
              </div>
              <div className="admin-card-info">
                <h3>{action.label}</h3>
                <p>{action.description}</p>
              </div>
              <button
                className={`admin-btn ${isRunning ? 'running' : ''}`}
                onClick={() => handleRun(action)}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    Running...
                  </>
                ) : (
                  'Run'
                )}
              </button>
              {result && (
                <div className={`admin-result ${result.success ? 'success' : 'error'}`}>
                  {result.success ? (
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  ) : (
                    <span>Error: {result.error}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="admin-schedule card">
        <h3><Settings size={16} /> Automated Schedule</h3>
        <div className="schedule-grid">
          <div className="schedule-item">
            <span className="schedule-day">Friday 08:00 UTC</span>
            <span className="schedule-task">Fetch Fixtures</span>
          </div>
          <div className="schedule-item">
            <span className="schedule-day">Friday 09:00 UTC</span>
            <span className="schedule-task">Sync Team Form</span>
          </div>
          <div className="schedule-item">
            <span className="schedule-day">Friday 10:00 UTC</span>
            <span className="schedule-task">Generate AI Analysis</span>
          </div>
          <div className="schedule-item">
            <span className="schedule-day">Monday 08:00 UTC</span>
            <span className="schedule-task">Fetch Match Results</span>
          </div>
          <div className="schedule-item">
            <span className="schedule-day">Monday 12:00 UTC</span>
            <span className="schedule-task">Evaluate Accuracy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
