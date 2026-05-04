import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { AppProvider, usePlayers } from './store/AppContext';
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

function ReadOnlyGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const { players, loading } = usePlayers();
  const location = useLocation();

  if (isAdmin) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#1A3A5C]/20 border-t-[#1A3A5C] rounded-full animate-spin" />
      </div>
    );
  }

  const myPlayer = players.find(p => p.email === user?.email);

  if (!myPlayer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <p className="text-gray-700 text-lg font-medium">No tienes ficha asignada</p>
        <p className="text-gray-500 text-sm">Contacta con el administrador para que vincule tu email a un perfil.</p>
      </div>
    );
  }

  const profileBase = `/players/${myPlayer.id}`;
  const allowed =
    location.pathname === profileBase ||
    location.pathname.startsWith(`${profileBase}/`) ||
    location.pathname.startsWith('/analyses/');

  if (!allowed) return <Navigate to={profileBase} replace />;

  return <>{children}</>;
}

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
        <ReadOnlyGuard>
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
        </ReadOnlyGuard>
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
