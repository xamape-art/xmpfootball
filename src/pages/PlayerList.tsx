import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, ChevronRight, Trash2 } from 'lucide-react';
import { usePlayers, useAnalyses } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { formatDate, trialDaysLeft, positionLabel } from '../utils';
import { PlayerAvatar } from './Dashboard';
import Badge from '../components/Badge';
import type { Position } from '../types';

export default function PlayerList() {
  const { players, deletePlayer } = usePlayers();
  const { getAnalysesByPlayer } = useAnalyses();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [filterPos, setFilterPos] = useState<Position | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'trial' | 'active' | 'inactive'>('all');

  const filtered = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.team.toLowerCase().includes(search.toLowerCase());
    const matchPos = filterPos === 'all' || p.position === filterPos;
    const matchStatus = filterStatus === 'all' || p.subscriptionStatus === filterStatus;
    return matchSearch && matchPos && matchStatus;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) {
      deletePlayer(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3A5C]">Jugadoras</h1>
          <p className="text-gray-500 text-sm mt-1">{players.length} jugadora{players.length !== 1 ? 's' : ''} registrada{players.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <Link
            to="/players/new"
            className="inline-flex items-center gap-2 bg-[#D67D2E] text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-[#c06a1f] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nueva jugadora
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar jugadora o equipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20 focus:border-[#1A3A5C] bg-white"
          />
        </div>
        <select
          value={filterPos}
          onChange={e => setFilterPos(e.target.value as Position | 'all')}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20 bg-white"
        >
          <option value="all">Todas las posiciones</option>
          <option value="delantera">Delanteras</option>
          <option value="extremo">Extremos</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20 bg-white"
        >
          <option value="all">Todos los estados</option>
          <option value="trial">En prueba</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Filter size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No se encontraron jugadoras</p>
          <p className="text-gray-400 text-sm mt-1">Prueba con otros filtros o añade una nueva jugadora</p>
          <Link to="/players/new" className="inline-flex items-center gap-2 mt-4 text-sm text-[#D67D2E] hover:underline">
            <Plus size={14} /> Añadir jugadora
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(player => {
            const days = trialDaysLeft(player.trialStartDate);
            const analyses = getAnalysesByPlayer(player.id);
            const lastAnalysis = analyses[0];
            return (
              <div key={player.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <Link to={`/players/${player.id}`} className="block p-5">
                  <div className="flex items-start gap-4">
                    <PlayerAvatar name={player.name} photo={player.photoUrl} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-[#1A3A5C] truncate">{player.name}</p>
                        <StatusBadge status={player.subscriptionStatus} days={days} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{player.team}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="navy">{positionLabel(player.position)}</Badge>
                        {player.side && <Badge variant="gray">{player.side}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold text-[#1A3A5C]">{analyses.length}</span> análisis
                      {lastAnalysis && <> · Último: {formatDate(lastAnalysis.date)}</>}
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-[#D67D2E] transition-colors" />
                  </div>
                </Link>
                {isAdmin && (
                  <div className="px-5 pb-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/players/${player.id}/analysis/new`}
                        className="flex-1 text-center text-xs font-medium py-2 rounded-lg bg-[#1A3A5C] text-white hover:bg-[#162f4a] transition-colors"
                      >
                        + Análisis
                      </Link>
                      <button
                        onClick={() => handleDelete(player.id, player.name)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, days }: { status: string; days: number }) {
  if (status === 'active') return <Badge variant="green" size="sm">Activa</Badge>;
  if (status === 'inactive') return <Badge variant="gray" size="sm">Inactiva</Badge>;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
      days <= 5 ? 'bg-red-100 text-red-700' : days <= 10 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
    }`}>
      {days}d prueba
    </span>
  );
}
