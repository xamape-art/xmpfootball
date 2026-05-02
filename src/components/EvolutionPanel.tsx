import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import type { Analysis, Player, ConceptRating } from '../types';
import { getConceptById } from '../data/concepts';
import { avg } from '../utils';

// ── Concept groups for radar (4 axes per position) ───────────────────────────

const GROUPS: Record<string, { label: string; ids: string[] }[]> = {
  extremo: [
    {
      label: 'Movimiento',
      ids: ['ext-of-02', 'ext-of-03', 'ext-of-13', 'ext-of-14', 'ext-of-16', 'ext-of-17', 'ext-of-18', 'ext-of-19'],
    },
    {
      label: '1v1',
      ids: ['ext-of-01', 'ext-of-04', 'ext-of-10', 'ext-of-11', 'ext-of-21'],
    },
    {
      label: 'Ataque / Centro',
      ids: ['ext-of-05', 'ext-of-06', 'ext-of-07', 'ext-of-08', 'ext-of-09', 'ext-of-12', 'ext-of-15', 'ext-of-20'],
    },
    {
      label: 'Defensa',
      ids: ['ext-def-01', 'ext-def-02', 'ext-def-03', 'ext-def-04', 'ext-def-05', 'ext-def-06', 'ext-def-07', 'ext-def-08'],
    },
  ],
  delantera: [
    {
      label: 'Desmarque',
      ids: ['del-of-03', 'del-of-06', 'del-of-08', 'del-of-09', 'del-of-10', 'del-of-12', 'del-of-14'],
    },
    {
      label: 'Finalización',
      ids: ['del-of-01', 'del-of-04', 'del-of-05', 'del-of-11', 'del-of-13'],
    },
    {
      label: 'Combinación',
      ids: ['del-of-02', 'del-of-07'],
    },
    {
      label: 'Defensa',
      ids: ['del-def-01', 'del-def-02', 'del-def-03', 'del-def-04', 'del-def-05'],
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function shortDate(d: string) {
  const [, m, day] = d.split('-');
  return `${day} ${MONTHS[parseInt(m) - 1]}`;
}

function flatRatings(a: Analysis): ConceptRating[] {
  return [...a.offensiveRatings, ...a.defensiveRatings];
}

function getRating(ratings: ConceptRating[], id: string): number {
  return ratings.find(r => r.conceptId === id)?.rating ?? 0;
}

function groupAvg(a: Analysis, ids: string[]): number {
  const vals = ids.map(id => getRating(flatRatings(a), id)).filter(v => v > 0);
  return vals.length ? parseFloat(avg(vals).toFixed(2)) : 0;
}

// ── Custom tooltip for line chart ─────────────────────────────────────────────

function LineTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-[#1A3A5C] mb-0.5">{label}</p>
      <p className="text-[#D67D2E] font-bold text-lg leading-none">{payload[0].value.toFixed(1)}<span className="text-xs text-gray-400 font-normal"> / 5.0</span></p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EvolutionPanel({ player, analyses }: { player: Player; analyses: Analysis[] }) {
  const sorted = useMemo(
    () => [...analyses].sort((a, b) => a.date.localeCompare(b.date)),
    [analyses],
  );

  if (sorted.length === 0) return null;

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const globalDelta = parseFloat((last.overallRating - first.overallRating).toFixed(2));
  const hasHistory = sorted.length >= 2;

  // ── Line chart data ───────────────────────────────────────────────────────
  const lineData = sorted.map(a => ({
    fecha: shortDate(a.date),
    valoración: a.overallRating,
  }));

  // ── Concept trend data ────────────────────────────────────────────────────
  const conceptIds = [...new Set([...flatRatings(first), ...flatRatings(last)].map(r => r.conceptId))];
  const deltas = conceptIds
    .map(id => {
      const firstVal = getRating(flatRatings(first), id);
      const lastVal = getRating(flatRatings(last), id);
      return {
        id,
        label: getConceptById(id)?.label ?? id,
        firstVal,
        lastVal,
        delta: parseFloat((lastVal - firstVal).toFixed(2)),
      };
    })
    .filter(d => d.firstVal > 0 || d.lastVal > 0);

  const improving = [...deltas].sort((a, b) => b.delta - a.delta).filter(d => d.delta > 0).slice(0, 3);
  const declining = [...deltas].sort((a, b) => a.delta - b.delta).filter(d => d.delta < 0).slice(0, 3);

  // ── Radar data ────────────────────────────────────────────────────────────
  const groups = GROUPS[player.position] ?? [];
  const radarData = groups.map(g => ({
    grupo: g.label,
    'Primer análisis': groupAvg(first, g.ids),
    'Último análisis': groupAvg(last, g.ids),
  }));
  const radarHasData = radarData.some(d => d['Primer análisis'] > 0 || d['Último análisis'] > 0);

  return (
    <div className="space-y-5">

      {/* Header + resumen global */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[#D67D2E]" />
          <h2 className="font-bold text-[#1A3A5C] text-lg">Mi evolución</h2>
        </div>
        <span className="text-xs text-gray-400 sm:ml-2">
          {shortDate(first.date)} → {shortDate(last.date)} · {sorted.length} análisis
        </span>
      </div>

      {/* Global delta pill */}
      {hasHistory && (
        <div className={`flex items-center gap-3 rounded-2xl px-5 py-4 ${
          globalDelta > 0 ? 'bg-green-50 border border-green-100' :
          globalDelta < 0 ? 'bg-red-50 border border-red-100' :
          'bg-gray-50 border border-gray-100'
        }`}>
          {globalDelta > 0
            ? <TrendingUp size={22} className="text-green-600 shrink-0" />
            : globalDelta < 0
            ? <TrendingDown size={22} className="text-red-500 shrink-0" />
            : <Minus size={22} className="text-gray-400 shrink-0" />}
          <div>
            <p className="font-semibold text-sm text-gray-800">
              {globalDelta > 0
                ? `Tu valoración ha mejorado +${globalDelta.toFixed(1)} puntos`
                : globalDelta < 0
                ? `Tu valoración ha bajado ${globalDelta.toFixed(1)} puntos`
                : 'Tu valoración se mantiene estable'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {first.overallRating.toFixed(1)} → {last.overallRating.toFixed(1)} · desde el {shortDate(first.date)}
            </p>
          </div>
        </div>
      )}

      {/* Line chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-[#1A3A5C] text-sm mb-4">Valoración global por análisis</h3>
        {!hasHistory ? (
          <p className="text-xs text-gray-400 text-center py-8">
            Necesitas al menos 2 análisis para ver la gráfica de evolución
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine y={2.5} stroke="#e5e7eb" strokeDasharray="4 3" label={{ value: 'media', position: 'right', fontSize: 9, fill: '#d1d5db' }} />
              <Tooltip content={<LineTooltip />} />
              <Line
                type="monotone"
                dataKey="valoración"
                stroke="#D67D2E"
                strokeWidth={2.5}
                dot={{ fill: '#D67D2E', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#D67D2E', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Trend cards */}
      {hasHistory && (improving.length > 0 || declining.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Improving */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <TrendingUp size={14} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-green-800 text-sm">Conceptos en mejora</h3>
            </div>
            {improving.length === 0 ? (
              <p className="text-xs text-gray-400">Sin mejoras detectadas aún</p>
            ) : (
              <div className="space-y-3">
                {improving.map(d => (
                  <div key={d.id} className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-snug">{d.label}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <RatingDots value={d.firstVal} color="gray" />
                        <span className="text-[10px] text-gray-300 mx-0.5">→</span>
                        <RatingDots value={d.lastVal} color="green" />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600 shrink-0">+{d.delta.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Declining */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <TrendingDown size={14} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-red-700 text-sm">Conceptos a trabajar</h3>
            </div>
            {declining.length === 0 ? (
              <p className="text-xs text-gray-400">Sin bajadas detectadas</p>
            ) : (
              <div className="space-y-3">
                {declining.map(d => (
                  <div key={d.id} className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-snug">{d.label}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <RatingDots value={d.firstVal} color="gray" />
                        <span className="text-[10px] text-gray-300 mx-0.5">→</span>
                        <RatingDots value={d.lastVal} color="red" />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-red-500 shrink-0">{d.delta.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Radar */}
      {hasHistory && radarHasData && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-[#1A3A5C] text-sm">Visión global por área</h3>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">Primer análisis vs. último análisis</p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="grupo" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <PolarRadiusAxis angle={45} domain={[0, 5]} tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickCount={4} />
              <Radar
                name="Primer análisis"
                dataKey="Primer análisis"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={0.2}
                strokeWidth={2}
                strokeDasharray="5 3"
              />
              <Radar
                name="Último análisis"
                dataKey="Último análisis"
                stroke="#D67D2E"
                fill="#D67D2E"
                fillOpacity={0.25}
                strokeWidth={2.5}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}

// ── Mini dot rating (5 dots filled) ──────────────────────────────────────────

function RatingDots({ value, color }: { value: number; color: 'gray' | 'green' | 'red' }) {
  const fill = color === 'green' ? 'bg-green-500' : color === 'red' ? 'bg-red-400' : 'bg-gray-300';
  const empty = 'bg-gray-100';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`w-2 h-2 rounded-full ${i <= value ? fill : empty}`} />
      ))}
    </div>
  );
}
