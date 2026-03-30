import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  timeout: 30000,
});

// ============ Leagues ============
export const getLeagues = () => api.get('/leagues').then(r => r.data);
export const getLeague = (id) => api.get(`/leagues/${id}`).then(r => r.data);

// ============ Matches ============
export const getWeekendMatches = (leagueId) => {
  const params = leagueId ? { leagueId } : {};
  return api.get('/matches/weekend', { params }).then(r => r.data);
};
export const getMatch = (id) => api.get(`/matches/${id}`).then(r => r.data);
export const getMatchesByGameweek = (id) => api.get(`/matches/gameweek/${id}`).then(r => r.data);

// ============ Analysis ============
export const getWeekendAnalyses = (leagueId) => {
  const params = leagueId ? { leagueId } : {};
  return api.get('/analysis/weekend', { params }).then(r => r.data);
};
export const getMatchAnalysis = (matchId) => api.get(`/analysis/match/${matchId}`).then(r => r.data);
export const generateAnalysis = (matchId) => api.post(`/analysis/generate/${matchId}`).then(r => r.data);
export const generateWeekendAnalyses = () => api.post('/analysis/generate/weekend').then(r => r.data);

// ============ Accuracy ============
export const getAccuracyOverview = (leagueId) => {
  const params = leagueId ? { leagueId } : {};
  return api.get('/accuracy/overview', { params }).then(r => r.data);
};
export const getGameweekAccuracy = (id) => api.get(`/accuracy/gameweek/${id}`).then(r => r.data);

// ============ Stryktipset ============
export const getStryktipsetCurrent = () => api.get('/stryktipset/current').then(r => r.data);
export const getStryktipsetDraw = (drawNumber) => api.get(`/stryktipset/draw/${drawNumber}`).then(r => r.data);
export const getStryktipsetHistory = () => api.get('/stryktipset/history').then(r => r.data);
export const syncStryktipset = () => api.post('/admin/sync/stryktipset').then(r => r.data);
export const syncStryktipsetPredictions = () => api.post('/admin/sync/stryktipset/predictions').then(r => r.data);
export const syncStryktipsetCoupon = () => api.post('/admin/sync/stryktipset/coupon', null, { timeout: 120000 }).then(r => r.data);

// ============ Admin ============
export const syncFixtures = () => api.post('/admin/sync/fixtures', null, { timeout: 120000 }).then(r => r.data);
export const syncForm = () => api.post('/admin/sync/form', null, { timeout: 120000 }).then(r => r.data);
export const syncResults = () => api.post('/admin/sync/results').then(r => r.data);
export const syncAnalysis = () => api.post('/admin/sync/analysis', null, { timeout: 600000 }).then(r => r.data);
export const syncAccuracy = () => api.post('/admin/sync/accuracy').then(r => r.data);
export const syncAll = () => api.post('/admin/sync/all').then(r => r.data);

export default api;
