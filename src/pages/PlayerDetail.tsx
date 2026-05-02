import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Calendar, Mail, Phone, Globe, FileText, Clock, TrendingUp, Activity } from 'lucide-react';
import { usePlayers, useAnalyses } from '../store/AppContext';
import { formatDate, trialDaysLeft, positionLabel, avg } from '../utils';
import { PlayerAvatar } from './Dashboard';
import Badge from '../components/Badge';
import StarRating from '../components/StarRating';
import EvolutionPanel from '../components/EvolutionPanel';

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlayer } = usePlayers();
  const { getAnalysesByPlayer } = useAnalyses();

  const player = getPlayer(id!);
  if (!player) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Jugadora no encontrada</p>
        <Link to="/players" className="text-[#D67D2E] text-sm hover:underline mt-2 inline-block">Volver al listado</Link>
      </div>
    );
  }

  const analyses = getAnalysesByPlayer(player.id);
  const days = trialDaysLeft(player.trialStartDate);
  const ratings = analyses.map(a => a.overallRating).filter(r => r > 0);
  const avgRating = ratings.length ? avg(ratings) : null;
  const trend = ratings.length >= 2
    ? ratings[0] - ratings[ratings.length - 1]
    : null;
  const [activeTab, setActiveTab] = useState<'historial' | 'evolucion'>('historial');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1A3A5C] transition-colors">
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Header card */}
      <div className="bg-[#1A3A5C] text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <PlayerAvatar name={player.name} photo={player.photoUrl} size="lg" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{player.name}</h1>
              <StatusChip status={player.subscriptionStatus} days={days} />
            </div>
            <p className="text-blue-200 mt-1 text-sm">{player.team}{player.nationality ? ` · ${player.nationality}` : ''}{player.age ? ` · ${player.age} años` : ''}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="orange">{positionLabel(player.position)}</Badge>
              {player.side && <Badge variant="gray">{player.side}</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/players/${player.id}/edit`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors">
              <Edit size={14} /> Editar
            </Link>
            <Link to={`/players/${player.id}/analysis/new`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D67D2E] hover:bg-[#c06a1f] text-sm font-medium transition-colors shadow">
              <Plus size={14} /> Nuevo análisis
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="font-semibold text-[#1A3A5C] text-sm uppercase tracking-wide">Estadísticas</h2>
            <StatRow icon={<FileText size={14} />} label="Análisis realizados" value={analyses.length} />
            {avgRating !== null && (
              <StatRow icon={<TrendingUp size={14} />} label="Valoración media" value={
                <span className="flex items-center gap-1">
                  <StarRating value={Math.round(avgRating)} readonly size={14} />
                  <span className="text-xs text-gray-500">{avgRating.toFixed(1)}</span>
                </span>
              } />
            )}
            {trend !== null && (
              <StatRow icon={<TrendingUp size={14} />} label="Tendencia" value={
                <span className={trend > 0 ? 'text-green-600 font-semibold' : trend < 0 ? 'text-red-500 font-semibold' : 'text-gray-500'}>
                  {trend > 0 ? `▲ +${trend.toFixed(1)}` : trend < 0 ? `▼ ${trend.toFixed(1)}` : '→ Estable'}
                </span>
              } />
            )}
            {player.subscriptionStatus === 'trial' && (
              <StatRow icon={<Clock size={14} />} label="Días de prueba restantes" value={
                <span className={days <= 5 ? 'text-red-600 font-semibold' : 'text-amber-600 font-semibold'}>
                  {days} días
                </span>
              } />
            )}
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h2 className="font-semibold text-[#1A3A5C] text-sm uppercase tracking-wide">Contacto</h2>
            {player.email && (
              <a href={`mailto:${player.email}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#D67D2E]">
                <Mail size={13} className="shrink-0" /> {player.email}
              </a>
            )}
            {player.phone && (
              <a href={`tel:${player.phone}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#D67D2E]">
                <Phone size={13} className="shrink-0" /> {player.phone}
              </a>
            )}
            {player.nationality && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Globe size={13} className="shrink-0" /> {player.nationality}
              </div>
            )}
            {!player.email && !player.phone && !player.nationality && (
              <p className="text-xs text-gray-400">Sin datos de contacto</p>
            )}
          </div>

          {/* Trial info */}
          {player.subscriptionStatus === 'trial' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-1">Periodo de prueba</p>
              <p className="text-xs text-amber-700">
                Inicio: {formatDate(player.trialStartDate)}<br />
                Vence: {formatDate(new Date(new Date(player.trialStartDate).getTime() + 30 * 86400000).toISOString())}
              </p>
              <p className="text-xs font-semibold text-amber-800 mt-2">{days} días restantes</p>
            </div>
          )}

          {player.notes && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#1A3A5C] mb-1">Notas</p>
              <p className="text-xs text-gray-600">{player.notes}</p>
            </div>
          )}
        </div>

        {/* Historial / Evolución tabs */}
        <div className="lg:col-span-2 space-y-4">

          {/* Tab bar */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('historial')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'historial'
                    ? 'bg-white text-[#1A3A5C] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={13} /> Historial
              </button>
              <button
                onClick={() => setActiveTab('evolucion')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'evolucion'
                    ? 'bg-white text-[#D67D2E] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Activity size={13} /> Mi evolución
                {analyses.length >= 2 && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#D67D2E]" />
                )}
              </button>
            </div>
            {activeTab === 'historial' && (
              <Link to={`/players/${player.id}/analysis/new`} className="text-sm text-[#D67D2E] hover:underline flex items-center gap-1">
                <Plus size={13} /> Nuevo
              </Link>
            )}
          </div>

          {/* Historial panel */}
          {activeTab === 'historial' && (
            analyses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <FileText size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Sin análisis todavía</p>
                <p className="text-gray-400 text-sm mt-1">Crea el primer análisis para esta jugadora</p>
                <Link
                  to={`/players/${player.id}/analysis/new`}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium bg-[#1A3A5C] text-white rounded-xl hover:bg-[#162f4a]"
                >
                  <Plus size={14} /> Crear análisis
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map(a => (
                  <Link
                    key={a.id}
                    to={`/analyses/${a.id}`}
                    className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow hover:border-[#1A3A5C]/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-semibold text-sm text-[#1A3A5C]">
                            {a.matchInfo.opponent ? `vs ${a.matchInfo.opponent}` : 'Análisis de partido'}
                          </span>
                          {a.matchInfo.competition && (
                            <Badge variant="gray" size="sm">{a.matchInfo.competition}</Badge>
                          )}
                          {a.matchInfo.result && (
                            <Badge variant="navy" size="sm">{a.matchInfo.result}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(a.date)}</span>
                          <span className="capitalize">{a.phase === 'ambos' ? 'Of. + Def.' : a.phase}</span>
                        </div>
                        {a.nextMatchFocus && (
                          <p className="mt-2 text-xs text-gray-600 bg-orange-50 rounded-lg px-3 py-1.5 border border-orange-100">
                            <span className="font-semibold text-[#D67D2E]">Foco: </span>{a.nextMatchFocus}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-lg font-bold ${a.overallRating >= 4 ? 'text-green-600' : a.overallRating >= 3 ? 'text-blue-600' : a.overallRating >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {a.overallRating.toFixed(1)}
                        </div>
                        <StarRating value={Math.round(a.overallRating)} readonly size={12} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {/* Evolución panel */}
          {activeTab === 'evolucion' && (
            analyses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <Activity size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Sin datos de evolución</p>
                <p className="text-gray-400 text-sm mt-1">Crea al menos 2 análisis para ver la progresión</p>
              </div>
            ) : (
              <EvolutionPanel player={player} analyses={analyses} />
            )
          )}

        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-sm font-semibold text-[#1A3A5C]">{value}</div>
    </div>
  );
}

function StatusChip({ status, days }: { status: string; days: number }) {
  if (status === 'active') return <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Activa</span>;
  if (status === 'inactive') return <span className="bg-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Inactiva</span>;
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${days <= 5 ? 'bg-red-500' : 'bg-amber-500'} text-white`}>
      Prueba · {days}d
    </span>
  );
}
