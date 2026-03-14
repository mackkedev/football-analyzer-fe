import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MatchDetail from './pages/MatchDetail';
import Accuracy from './pages/Accuracy';
import Admin from './pages/Admin';
import Stryktipset from './pages/Stryktipset';
import StryktipsetDraw from './pages/StryktipsetDraw';
import StryktipsetHistory from './pages/StryktipsetHistory';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="match/:matchId" element={<MatchDetail />} />
          <Route path="accuracy" element={<Accuracy />} />
          <Route path="admin" element={<Admin />} />
          <Route path="stryktipset" element={<Stryktipset />} />
          <Route path="stryktipset/history" element={<StryktipsetHistory />} />
          <Route path="stryktipset/draw/:drawNumber" element={<StryktipsetDraw />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
