import { Link } from 'react-router-dom';
import { Users, FileText, TrendingUp, Star, Plus, ArrowRight, Clock } from 'lucide-react';
import { usePlayers, useAnalyses } from '../store/AppContext';
import { formatDate, trialDaysLeft, positionLabel } from '../utils';
import Badge from '../components/Badge';

export default function Dashboard() {
  const { players } = usePlayers();
  const { analyses } = useAnalyses();

  const totalPlayers = players.length;
  const totalAnalyses = analyses.length;
  const avgRating = analyses.length
    ? (analyses.reduce((s, a) => s + a.overallRating, 0) / analyses.length).toFixed(1)
    : '—';
  const recentAnalyses = [...analyses]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const trialPlayers = players.filter(p => p.subscriptionStatus === 'trial');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3A5C]">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Bienvenida a XMP Football Analysis</p>
        </div>
        <Link
          to="/players/new"
          className="inline-flex items-center gap-2 bg-[#D67D2E] text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-[#c06a1f] transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nueva jugadora
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="Jugadoras" value={totalPlayers} color="navy" />
        <StatCard icon={<FileText size={20} />} label="Análisis" value={totalAnalyses} color="orange" />
        <StatCard icon={<Star size={20} />} label="Valoración media" value={avgRating} color="green" />
        <StatCard icon={<Clock size={20} />} label="En prueba" value={trialPlayers.length} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent analyses */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#1A3A5C]">Análisis recientes</h2>
            <Link to="/reports" className="text-sm text-[#D67D2E] hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          {recentAnalyses.length === 0 ? (
            <EmptyState
              text="Aún no hay análisis"
              sub="Crea el primer análisis desde el perfil de una jugadora"
            />
          ) : (
            <div className="space-y-3">
              {recentAnalyses.map(a => {
                const player = players.find(p => p.id === a.playerId);
                return (
                  <Link
                    key={a.id}
                    to={`/analyses/${a.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                  >
                    <PlayerAvatar name={player?.name ?? '?'} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#1A3A5C] truncate">{player?.name ?? 'Jugadora eliminada'}</p>
                      <p className="text-xs text-gray-500">{a.matchInfo.opponent ? `vs ${a.matchInfo.opponent}` : 'Sin rival'} · {formatDate(a.date)}</p>
                    </div>
                    <RatingPill rating={a.overallRating} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Players panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#1A3A5C]">Jugadoras</h2>
            <Link to="/players" className="text-sm text-[#D67D2E] hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          {players.length === 0 ? (
            <EmptyState
              text="Sin jugadoras"
              sub="Añade tu primera jugadora piloto"
              action={<Link to="/players/new" className="text-sm text-[#D67D2E] hover:underline">Añadir jugadora →</Link>}
            />
          ) : (
            <div className="space-y-3">
              {players.slice(0, 6).map(p => {
                const days = trialDaysLeft(p.trialStartDate);
                const count = analyses.filter(a => a.playerId === p.id).length;
                return (
                  <Link
                    key={p.id}
                    to={`/players/${p.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <PlayerAvatar name={p.name} photo={p.photoUrl} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#1A3A5C] truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{positionLabel(p.position)} · {count} análisis</p>
                    </div>
                    {p.subscriptionStatus === 'trial' && (
                      <span className="text-xs text-amber-600 font-medium whitespace-nowrap">{days}d</span>
                    )}
                    {p.subscriptionStatus === 'active' && (
                      <Badge variant="green">Pro</Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Trial alerts */}
      {trialPlayers.filter(p => trialDaysLeft(p.trialStartDate) <= 5 && trialDaysLeft(p.trialStartDate) > 0).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <TrendingUp size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-900 text-sm">Periodos de prueba próximos a vencer</p>
              <div className="mt-2 space-y-1">
                {trialPlayers
                  .filter(p => trialDaysLeft(p.trialStartDate) <= 5 && trialDaysLeft(p.trialStartDate) > 0)
                  .map(p => (
                    <Link key={p.id} to={`/players/${p.id}`} className="block text-xs text-amber-700 hover:underline">
                      {p.name} — {trialDaysLeft(p.trialStartDate)} días restantes
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    navy: 'bg-[#1A3A5C] text-white',
    orange: 'bg-[#D67D2E] text-white',
    green: 'bg-green-500 text-white',
    amber: 'bg-amber-500 text-white',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${colors[color]} mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[#1A3A5C]">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export function PlayerAvatar({ name, photo, size = 'sm' }: { name: string; photo?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClass = size === 'xl' ? 'w-20 h-20 text-2xl' : size === 'lg' ? 'w-16 h-16 text-xl' : size === 'md' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm';
  if (photo) {
    return <img src={photo} alt={name} className={`${sizeClass} rounded-full object-cover border-2 border-white shadow-sm`} />;
  }
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`${sizeClass} rounded-full bg-[#1A3A5C] text-white flex items-center justify-center font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

function RatingPill({ rating }: { rating: number }) {
  const color = rating >= 4 ? 'bg-green-100 text-green-800' : rating >= 3 ? 'bg-blue-100 text-blue-800' : rating >= 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${color}`}>
      {rating.toFixed(1)}
    </span>
  );
}

function EmptyState({ text, sub, action }: { text: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-8 text-gray-400">
      <p className="font-medium text-sm text-gray-500">{text}</p>
      <p className="text-xs mt-1">{sub}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
