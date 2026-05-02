import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Video, Target, Shield, Swords, Loader2 } from 'lucide-react';
import { usePlayers, useAnalyses } from '../store/AppContext';
import { getConcepts } from '../data/concepts';
import { generateId, avg } from '../utils';
import StarRating from '../components/StarRating';
import type { Analysis, ConceptRating, Phase } from '../types';

export default function AnalysisForm() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { getPlayer } = usePlayers();
  const { addAnalysis } = useAnalyses();
  const player = getPlayer(playerId!);

  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('ambos');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchInfo, setMatchInfo] = useState({ opponent: '', competition: '', result: '', venue: '' });
  const [videoUrl, setVideoUrl] = useState('');
  const [offRatings, setOffRatings] = useState<ConceptRating[]>([]);
  const [defRatings, setDefRatings] = useState<ConceptRating[]>([]);
  const [generalObs, setGeneralObs] = useState('');
  const [strengths, setStrengths] = useState(['', '', '']);
  const [improvements, setImprovements] = useState(['', '', '']);
  const [focus, setFocus] = useState('');
  const [saving, setSaving] = useState(false);

  if (!player) {
    return <div className="text-center py-20 text-gray-500">Jugadora no encontrada</div>;
  }

  const offConcepts = getConcepts(player.position, 'ofensivo');
  const defConcepts = getConcepts(player.position, 'defensivo');

  const setRating = (setter: React.Dispatch<React.SetStateAction<ConceptRating[]>>, id: string, val: number) => {
    setter(prev => {
      const existing = prev.find(r => r.conceptId === id);
      if (existing) return prev.map(r => r.conceptId === id ? { ...r, rating: val } : r);
      return [...prev, { conceptId: id, rating: val }];
    });
  };

  const setNote = (setter: React.Dispatch<React.SetStateAction<ConceptRating[]>>, id: string, note: string) => {
    setter(prev => {
      const existing = prev.find(r => r.conceptId === id);
      if (existing) return prev.map(r => r.conceptId === id ? { ...r, note } : r);
      return [...prev, { conceptId: id, rating: 0, note }];
    });
  };

  const calcOverall = () => {
    const all = [
      ...(phase !== 'defensivo' ? offRatings : []),
      ...(phase !== 'ofensivo' ? defRatings : []),
    ].filter(r => r.rating > 0).map(r => r.rating);
    return all.length ? avg(all) : 0;
  };

  const handleSubmit = async () => {
    setSaving(true);
    const analysis: Analysis = {
      id: generateId(),
      playerId: player.id,
      date,
      matchInfo,
      videoUrl: videoUrl || undefined,
      phase,
      offensiveRatings: phase !== 'defensivo' ? offRatings : [],
      defensiveRatings: phase !== 'ofensivo' ? defRatings : [],
      generalObservations: generalObs || undefined,
      strengths: strengths.filter(Boolean),
      improvements: improvements.filter(Boolean),
      nextMatchFocus: focus,
      overallRating: parseFloat(calcOverall().toFixed(2)),
      createdAt: new Date().toISOString(),
    };
    try {
      await addAnalysis(analysis);
      navigate(`/analyses/${analysis.id}`);
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { label: 'Partido', icon: Target },
    ...(phase !== 'defensivo' ? [{ label: 'Ofensivo', icon: Swords }] : []),
    ...(phase !== 'ofensivo' ? [{ label: 'Defensivo', icon: Shield }] : []),
    { label: 'Informe', icon: Save },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1A3A5C]">Nuevo análisis</h1>
          <p className="text-gray-500 text-sm">{player.name} · {player.position === 'delantera' ? 'Delantera' : 'Extremo'}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const active = step === i;
          const done = step > i;
          return (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active ? 'bg-[#1A3A5C] text-white' : done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Icon size={13} /> {s.label}
              </button>
              {i < steps.length - 1 && <div className={`h-px w-4 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Step 0: Match info */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-[#1A3A5C]">Información del partido</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Fecha">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Fase a analizar">
                <select value={phase} onChange={e => setPhase(e.target.value as Phase)} className={inputCls}>
                  <option value="ambos">Ofensivo + Defensivo</option>
                  <option value="ofensivo">Solo Ofensivo</option>
                  <option value="defensivo">Solo Defensivo</option>
                </select>
              </Field>
              <Field label="Rival">
                <input type="text" value={matchInfo.opponent} onChange={e => setMatchInfo(p => ({ ...p, opponent: e.target.value }))} placeholder="Nombre del equipo rival" className={inputCls} />
              </Field>
              <Field label="Competición">
                <input type="text" value={matchInfo.competition} onChange={e => setMatchInfo(p => ({ ...p, competition: e.target.value }))} placeholder="Liga, Copa..." className={inputCls} />
              </Field>
              <Field label="Resultado">
                <input type="text" value={matchInfo.result} onChange={e => setMatchInfo(p => ({ ...p, result: e.target.value }))} placeholder="Ej: 2-1" className={inputCls} />
              </Field>
              <Field label="Estadio / Sede">
                <input type="text" value={matchInfo.venue} onChange={e => setMatchInfo(p => ({ ...p, venue: e.target.value }))} placeholder="Estadio o ciudad" className={inputCls} />
              </Field>
            </div>
            <Field label="Enlace de vídeo (YouTube)">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Video size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={inputCls + ' pl-9'}
                  />
                </div>
              </div>
              {videoUrl && <p className="text-xs text-green-600 mt-1">✓ Vídeo detectado — se incrustará en el informe</p>}
            </Field>
          </div>
        )}

        {/* Offensive concepts */}
        {steps[step]?.label === 'Ofensivo' && (
          <ConceptSection
            title="Conceptos Ofensivos"
            subtitle={`${offConcepts.length} conceptos a valorar`}
            concepts={offConcepts}
            ratings={offRatings}
            onRate={(id, val) => setRating(setOffRatings, id, val)}
            onNote={(id, note) => setNote(setOffRatings, id, note)}
            color="orange"
          />
        )}

        {/* Defensive concepts */}
        {steps[step]?.label === 'Defensivo' && (
          <ConceptSection
            title="Conceptos Defensivos"
            subtitle={`${defConcepts.length} conceptos a valorar`}
            concepts={defConcepts}
            ratings={defRatings}
            onRate={(id, val) => setRating(setDefRatings, id, val)}
            onNote={(id, note) => setNote(setDefRatings, id, note)}
            color="navy"
          />
        )}

        {/* Report step */}
        {step === steps.length - 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-[#1A3A5C] mb-1">Plan de mejora</h2>
              <p className="text-xs text-gray-500">Completa el informe con los puntos clave del análisis</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs">✓</span>
                3 Fortalezas
              </p>
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                  <input
                    type="text"
                    value={strengths[i]}
                    onChange={e => setStrengths(prev => prev.map((s, j) => j === i ? e.target.value : s))}
                    placeholder={`Fortaleza ${i + 1}...`}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center text-xs">↑</span>
                3 Áreas de mejora
              </p>
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                  <input
                    type="text"
                    value={improvements[i]}
                    onChange={e => setImprovements(prev => prev.map((s, j) => j === i ? e.target.value : s))}
                    placeholder={`Área de mejora ${i + 1}...`}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold text-[#D67D2E] mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs">★</span>
                Foco único para el próximo partido
              </p>
              <textarea
                value={focus}
                onChange={e => setFocus(e.target.value)}
                rows={3}
                placeholder="Define el único concepto o aspecto en el que la jugadora debe concentrarse en el próximo partido..."
                className={inputCls + ' resize-none'}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Observaciones generales</p>
              <textarea
                value={generalObs}
                onChange={e => setGeneralObs(e.target.value)}
                rows={3}
                placeholder="Contexto del partido, condiciones, actuación general..."
                className={inputCls + ' resize-none'}
              />
            </div>

            {/* Preview overall */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">Valoración global calculada</span>
              <span className={`text-2xl font-bold ${calcOverall() >= 4 ? 'text-green-600' : calcOverall() >= 3 ? 'text-blue-600' : calcOverall() >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                {calcOverall() > 0 ? calcOverall().toFixed(1) : '—'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <ArrowLeft size={15} /> {step === 0 ? 'Cancelar' : 'Anterior'}
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#1A3A5C] text-white rounded-xl hover:bg-[#162f4a] shadow-sm"
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#D67D2E] text-white rounded-xl hover:bg-[#c06a1f] shadow-sm disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Guardando…' : 'Guardar análisis'}
          </button>
        )}
      </div>
    </div>
  );
}

function ConceptSection({
  title, subtitle, concepts, ratings, onRate, onNote, color,
}: {
  title: string;
  subtitle: string;
  concepts: { id: string; label: string; description?: string }[];
  ratings: ConceptRating[];
  onRate: (id: string, val: number) => void;
  onNote: (id: string, note: string) => void;
  color: 'orange' | 'navy';
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const rated = ratings.filter(r => r.rating > 0).length;
  const headerColor = color === 'orange' ? 'text-[#D67D2E]' : 'text-[#1A3A5C]';
  const borderColor = color === 'orange' ? 'border-orange-200' : 'border-blue-200';
  const bgColor = color === 'orange' ? 'bg-orange-50' : 'bg-blue-50';

  return (
    <div className="space-y-4">
      <div>
        <h2 className={`font-semibold ${headerColor}`}>{title}</h2>
        <p className="text-xs text-gray-400">{subtitle} · {rated} valorados</p>
      </div>
      <div className="space-y-2">
        {concepts.map(c => {
          const rating = ratings.find(r => r.conceptId === c.id)?.rating ?? 0;
          const note = ratings.find(r => r.conceptId === c.id)?.note ?? '';
          const isOpen = expanded === c.id;
          return (
            <div key={c.id} className={`rounded-xl border ${rating > 0 ? borderColor : 'border-gray-100'} ${rating > 0 ? bgColor : 'bg-gray-50'} overflow-hidden`}>
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => setExpanded(isOpen ? null : c.id)}
              >
                <div className="flex-1">
                  <p className={`text-sm font-medium ${rating > 0 ? 'text-[#1A3A5C]' : 'text-gray-600'}`}>{c.label}</p>
                  {c.description && <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{c.description}</p>}
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <StarRating value={rating} onChange={v => onRate(c.id, v)} size={18} />
                </div>
              </div>
              {isOpen && (
                <div className="px-3 pb-3">
                  <input
                    type="text"
                    value={note}
                    onChange={e => onNote(c.id, e.target.value)}
                    placeholder="Observación específica (opcional)..."
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20 bg-white"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20 focus:border-[#1A3A5C] transition-colors bg-white';
