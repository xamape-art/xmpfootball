import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { AppProvider } from './store/AppContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PlayerList from './pages/PlayerList';
import PlayerDetail from './pages/PlayerDetail';
import PlayerForm from './pages/PlayerForm';
import AnalysisForm from './pages/AnalysisForm';
import AnalysisDetail from './pages/AnalysisDetail';
import Reports from './pages/Reports';
import AdminUsers from './pages/AdminUsers';

function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A3A5C] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <AppProvider>
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
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
      </Layout>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
