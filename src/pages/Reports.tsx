import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Calendar, Search } from 'lucide-react';
import { usePlayers, useAnalyses } from '../store/AppContext';
import { formatDate, positionLabel, phaseLabel } from '../utils';
import { PlayerAvatar } from './Dashboard';
import StarRating from '../components/StarRating';
import Badge from '../components/Badge';

export default function Reports() {
  const { players } = usePlayers();
  const { analyses } = useAnalyses();
  const [search, setSearch] = useState('');
  const [filterPlayer, setFilterPlayer] = useState('all');

  const filtered = analyses
    .filter(a => {
      const player = players.find(p => p.id === a.playerId);
      const matchSearch = !search || (player?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (a.matchInfo.opponent ?? '').toLowerCase().includes(search.toLowerCase());
      const matchPlayer = filterPlayer === 'all' || a.playerId === filterPlayer;
      return matchSearch && matchPlayer;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3A5C]">Informes</h1>
        <p className="text-gray-500 text-sm mt-1">{analyses.length} análisis en total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por jugadora o rival..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20 bg-white"
          />
        </div>
        <select
          value={filterPlayer}
          onChange={e => setFilterPlayer(e.target.value)}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
        >
          <option value="all">Todas las jugadoras</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <BarChart3 size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No hay análisis</p>
          <p className="text-gray-400 text-sm mt-1">
            {analyses.length === 0 ? 'Crea el primer análisis desde el perfil de una jugadora' : 'Prueba con otros filtros'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const player = players.find(p => p.id === a.playerId);
            return (
              <Link
                key={a.id}
                to={`/analyses/${a.id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-[#1A3A5C]/20 p-5"
              >
                <div className="flex items-start gap-4">
                  {player && <PlayerAvatar name={player.name} photo={player.photoUrl} size="sm" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-[#1A3A5C]">
                          {player?.name ?? 'Jugadora eliminada'}
                          {a.matchInfo.opponent && <span className="text-gray-400 font-normal"> · vs {a.matchInfo.opponent}</span>}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={11} />{formatDate(a.date)}</span>
                          {player && <Badge variant="navy" size="sm">{positionLabel(player.position)}</Badge>}
                          <Badge variant="gray" size="sm">{phaseLabel(a.phase)}</Badge>
                          {a.matchInfo.competition && <Badge variant="gray" size="sm">{a.matchInfo.competition}</Badge>}
                          {a.matchInfo.result && <Badge variant="orange" size="sm">{a.matchInfo.result}</Badge>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xl font-bold ${a.overallRating >= 4 ? 'text-green-600' : a.overallRating >= 3 ? 'text-blue-600' : a.overallRating >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {a.overallRating.toFixed(1)}
                        </p>
                        <StarRating value={Math.round(a.overallRating)} readonly size={13} />
                      </div>
                    </div>
                    {a.nextMatchFocus && (
                      <div className="mt-2 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-100 text-xs text-gray-700">
                        <span className="font-semibold text-[#D67D2E]">Foco: </span>{a.nextMatchFocus}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
