import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PlayerList from './pages/PlayerList';
import PlayerDetail from './pages/PlayerDetail';
import PlayerForm from './pages/PlayerForm';
import AnalysisForm from './pages/AnalysisForm';
import AnalysisDetail from './pages/AnalysisDetail';
import Reports from './pages/Reports';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/players" element={<PlayerList />} />
            <Route path="/players/new" element={<PlayerForm />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/players/:id/edit" element={<PlayerForm />} />
            <Route path="/players/:playerId/analysis/new" element={<AnalysisForm />} />
            <Route path="/analyses/:id" element={<AnalysisDetail />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
