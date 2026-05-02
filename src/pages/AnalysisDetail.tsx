import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Printer, Trash2, Calendar, MapPin, Trophy, Video,
  CheckCircle, ArrowUpCircle, Target, Star, Download, Loader2,
  Edit2, Save, X,
} from 'lucide-react';
import { useAnalyses, usePlayers } from '../store/AppContext';
import { getConcepts, getConceptById } from '../data/concepts';
import { formatDate, getYouTubeEmbedUrl, phaseLabel, avg } from '../utils';
import { PlayerAvatar } from './Dashboard';
import StarRating from '../components/StarRating';
import Logo from '../components/Logo';
import type { ConceptRating } from '../types';

export default function AnalysisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAnalysis, deleteAnalysis, updateAnalysis } = useAnalyses();
  const { getPlayer } = usePlayers();

  const analysis = getAnalysis(id!);
  const player = analysis ? getPlayer(analysis.playerId) : undefined;

  const [downloading, setDownloading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state — populated when entering edit mode
  const [editOffRatings, setEditOffRatings] = useState<ConceptRating[]>([]);
  const [editDefRatings, setEditDefRatings] = useState<ConceptRating[]>([]);
  const [editStrengths, setEditStrengths] = useState(['', '', '']);
  const [editImprovements, setEditImprovements] = useState(['', '', '']);
  const [editFocus, setEditFocus] = useState('');
  const [editObs, setEditObs] = useState('');

  if (!analysis || !player) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Análisis no encontrado</p>
        <Link to="/" className="text-[#D67D2E] text-sm hover:underline mt-2 inline-block">Volver al dashboard</Link>
      </div>
    );
  }

  const embedUrl = analysis.videoUrl ? getYouTubeEmbedUrl(analysis.videoUrl) : null;
  const allRatings = [...analysis.offensiveRatings, ...analysis.defensiveRatings].filter(r => r.rating > 0);
  const topConcepts = [...allRatings].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const bottomConcepts = [...allRatings].sort((a, b) => a.rating - b.rating).filter(r => r.rating > 0).slice(0, 3);

  // ── Edit helpers ──────────────────────────────────────────────────────────

  const startEditing = () => {
    setEditOffRatings([...analysis.offensiveRatings]);
    setEditDefRatings([...analysis.defensiveRatings]);
    setEditStrengths([...analysis.strengths, '', '', ''].slice(0, 3));
    setEditImprovements([...analysis.improvements, '', '', ''].slice(0, 3));
    setEditFocus(analysis.nextMatchFocus ?? '');
    setEditObs(analysis.generalObservations ?? '');
    setIsEditing(true);
  };

  const setRating = (
    setter: React.Dispatch<React.SetStateAction<ConceptRating[]>>,
    conceptId: string,
    rating: number,
  ) => {
    setter(prev => {
      const exists = prev.find(r => r.conceptId === conceptId);
      if (exists) return prev.map(r => r.conceptId === conceptId ? { ...r, rating } : r);
      return [...prev, { conceptId, rating }];
    });
  };

  const calcOverall = (off: ConceptRating[], def: ConceptRating[]) => {
    const vals = [...off, ...def].filter(r => r.rating > 0).map(r => r.rating);
    return vals.length ? avg(vals) : 0;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAnalysis(analysis.id, {
        offensiveRatings: editOffRatings,
        defensiveRatings: editDefRatings,
        strengths: editStrengths.filter(Boolean),
        improvements: editImprovements.filter(Boolean),
        nextMatchFocus: editFocus,
        generalObservations: editObs || undefined,
        overallRating: parseFloat(calcOverall(editOffRatings, editDefRatings).toFixed(2)),
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  // ── PDF download ──────────────────────────────────────────────────────────

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableW = pageW - margin * 2;
      const gap = 4;
      let currentY = margin;
      let firstSection = true;

      const sections = Array.from(document.querySelectorAll('[data-pdf-section]'));

      for (const section of sections) {
        const el = section as HTMLElement;

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 900,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const sectionH = (canvas.height * usableW) / canvas.width;

        // New page if section doesn't fit — never cut a section mid-content
        if (!firstSection && currentY + sectionH > pageH - margin) {
          pdf.addPage();
          currentY = margin;
        }

        // Section taller than a full page (e.g. long concept list): split by pages
        if (sectionH > pageH - margin * 2) {
          let yOffset = 0;
          while (yOffset < sectionH) {
            if (yOffset > 0) { pdf.addPage(); currentY = margin; }
            pdf.addImage(imgData, 'JPEG', margin, currentY - yOffset, usableW, sectionH);
            yOffset += pageH - margin * 2;
          }
          currentY = margin + sectionH - Math.floor(sectionH / (pageH - margin * 2)) * (pageH - margin * 2);
        } else {
          pdf.addImage(imgData, 'JPEG', margin, currentY, usableW, sectionH);
          currentY += sectionH + gap;
        }

        firstSection = false;
      }

      pdf.save(`XMP_${player.name.replace(/\s+/g, '_')}_${analysis.date}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  // ── Concepts for edit mode ────────────────────────────────────────────────

  const offConcepts = getConcepts(player.position, 'ofensivo');
  const defConcepts = getConcepts(player.position, 'defensivo');

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Actions bar — never in PDF */}
      <div className="flex items-center justify-between flex-wrap gap-2 no-print">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1A3A5C]">
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-[#1A3A5C] text-white hover:bg-[#162f4a] disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600"
              >
                <X size={15} /> Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditing}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-[#D67D2E] rounded-xl hover:bg-orange-50 text-[#D67D2E]"
              >
                <Edit2 size={15} /> Editar informe
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                <Printer size={15} /> Imprimir
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-[#1A3A5C] rounded-xl hover:bg-[#1A3A5C] hover:text-white text-[#1A3A5C] transition-colors disabled:opacity-50"
              >
                {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                {downloading ? 'Generando…' : 'Descargar'}
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-red-200 rounded-xl hover:bg-red-50 text-red-500"
              >
                <Trash2 size={15} /> Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── PDF content area ── */}
      <div className="space-y-5">

        {/* Header card */}
        <div data-pdf-section className="bg-[#1A3A5C] text-white rounded-2xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <PlayerAvatar name={player.name} photo={player.photoUrl} size="md" />
              <div>
                <p className="text-blue-300 text-xs font-medium uppercase tracking-wide mb-1">Informe de análisis individual</p>
                <h1 className="text-xl font-bold">{player.name}</h1>
                <p className="text-blue-200 text-sm">{player.team} · {player.position === 'delantera' ? 'Delantera' : 'Extremo'}</p>
              </div>
            </div>
            <Logo variant="white" size="md" />
          </div>
          {/* Fila 1: fecha, fase y datos del partido */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-x-8 gap-y-2">
            <InfoItem icon={<Calendar size={13} />} label="Fecha" value={formatDate(analysis.date)} />
            <InfoItem icon={<Target size={13} />} label="Fase" value={phaseLabel(analysis.phase)} />
            {analysis.matchInfo.opponent && <InfoItem icon={<Trophy size={13} />} label="Rival" value={analysis.matchInfo.opponent} />}
            {analysis.matchInfo.competition && <InfoItem icon={<Target size={13} />} label="Competición" value={analysis.matchInfo.competition} />}
            {analysis.matchInfo.result && <InfoItem icon={<Star size={13} />} label="Resultado" value={analysis.matchInfo.result} />}
            {analysis.matchInfo.venue && <InfoItem icon={<MapPin size={13} />} label="Sede" value={analysis.matchInfo.venue} />}
          </div>
          {/* Fila 2: valoración global y conceptos evaluados */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <p className="text-blue-300 text-[10px] uppercase tracking-wide">Valoración global</p>
              <span className="text-[#D67D2E] font-bold text-2xl leading-none">{analysis.overallRating.toFixed(1)}</span>
              <StarRating value={Math.round(analysis.overallRating)} readonly size={14} />
            </div>
            <div className="w-px h-5 bg-white/20 shrink-0" />
            <div className="flex items-center gap-3">
              <p className="text-blue-300 text-[10px] uppercase tracking-wide">Conceptos evaluados</p>
              <span className="text-white font-bold text-2xl leading-none">{allRatings.length}</span>
              <span className="text-blue-300 text-xs">/ {analysis.offensiveRatings.length + analysis.defensiveRatings.length}</span>
            </div>
          </div>
        </div>

        {/* Video — skipped in PDF, can't capture iframe */}
        {embedUrl && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <Video size={16} className="text-[#D67D2E]" />
              <h2 className="font-semibold text-[#1A3A5C] text-sm">Vídeo del partido</h2>
              <span className="ml-auto text-xs text-gray-400 no-print">(no incluido en PDF)</span>
            </div>
            <div className="relative" style={{ paddingTop: '56.25%' }}>
              <iframe src={embedUrl} title="Vídeo análisis" className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        )}

        {/* Video link for PDF (only shown in PDF render) */}
        {analysis.videoUrl && (
          <div data-pdf-section className="hidden-screen bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-600">
              <span className="font-semibold text-[#1A3A5C]">Enlace al vídeo: </span>
              {analysis.videoUrl}
            </p>
          </div>
        )}

        {/* Plan de mejora */}
        <div data-pdf-section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#1A3A5C] text-lg mb-5">Plan de mejora</h2>
          <div className="grid sm:grid-cols-3 gap-4">

            {/* Fortalezas */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-green-600 shrink-0" />
                <h3 className="font-semibold text-green-800 text-sm">Fortalezas</h3>
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>
                      <input
                        type="text"
                        value={editStrengths[i]}
                        onChange={e => setEditStrengths(prev => prev.map((s, j) => j === i ? e.target.value : s))}
                        placeholder={`Fortaleza ${i + 1}…`}
                        className="flex-1 text-xs px-2 py-1.5 border border-green-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 bg-white"
                      />
                    </div>
                  ))}
                </div>
              ) : analysis.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-green-700">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-[10px]">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-green-600 opacity-60">Sin registrar</p>}
            </div>

            {/* Áreas de mejora */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpCircle size={16} className="text-amber-600 shrink-0" />
                <h3 className="font-semibold text-amber-800 text-sm">Áreas de mejora</h3>
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>
                      <input
                        type="text"
                        value={editImprovements[i]}
                        onChange={e => setEditImprovements(prev => prev.map((s, j) => j === i ? e.target.value : s))}
                        placeholder={`Área de mejora ${i + 1}…`}
                        className="flex-1 text-xs px-2 py-1.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
                      />
                    </div>
                  ))}
                </div>
              ) : analysis.improvements.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-[10px]">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-amber-600 opacity-60">Sin registrar</p>}
            </div>

            {/* Foco */}
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Target size={16} className="text-[#D67D2E] shrink-0" />
                <h3 className="font-semibold text-[#D67D2E] text-sm">Foco próximo partido</h3>
              </div>
              {isEditing ? (
                <textarea
                  value={editFocus}
                  onChange={e => setEditFocus(e.target.value)}
                  rows={4}
                  placeholder="Define el foco único para el próximo partido…"
                  className="w-full text-xs px-2 py-1.5 border border-orange-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white resize-none"
                />
              ) : analysis.nextMatchFocus ? (
                <p className="text-sm font-medium text-[#1A3A5C] leading-relaxed">{analysis.nextMatchFocus}</p>
              ) : (
                <p className="text-xs text-gray-400">Sin definir</p>
              )}
            </div>
          </div>

          {/* Observaciones generales */}
          {(isEditing || analysis.generalObservations) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-600 mb-2">Observaciones generales</p>
              {isEditing ? (
                <textarea
                  value={editObs}
                  onChange={e => setEditObs(e.target.value)}
                  rows={3}
                  placeholder="Contexto del partido, condiciones, actuación general…"
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20 resize-none bg-white"
                />
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.generalObservations}</p>
              )}
            </div>
          )}
        </div>

        {/* Conceptos ofensivos */}
        {analysis.phase !== 'defensivo' && (
          <div data-pdf-section>
            {isEditing ? (
              <EditRatingsSection
                title="Conceptos Ofensivos"
                concepts={offConcepts}
                ratings={editOffRatings}
                onRate={(cid, val) => setRating(setEditOffRatings, cid, val)}
                color="orange"
              />
            ) : (
              <RatingSection title="Conceptos Ofensivos" ratings={analysis.offensiveRatings} color="orange" />
            )}
          </div>
        )}

        {/* Conceptos defensivos */}
        {analysis.phase !== 'ofensivo' && (
          <div data-pdf-section>
            {isEditing ? (
              <EditRatingsSection
                title="Conceptos Defensivos"
                concepts={defConcepts}
                ratings={editDefRatings}
                onRate={(cid, val) => setRating(setEditDefRatings, cid, val)}
                color="navy"
              />
            ) : (
              <RatingSection title="Conceptos Defensivos" ratings={analysis.defensiveRatings} color="navy" />
            )}
          </div>
        )}

        {/* Edit: valoración global en tiempo real */}
        {isEditing && (
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
            <span className="text-sm text-gray-600 font-medium">Valoración global recalculada</span>
            <span className={`text-2xl font-bold ${calcOverall(editOffRatings, editDefRatings) >= 4 ? 'text-green-600' : calcOverall(editOffRatings, editDefRatings) >= 3 ? 'text-blue-600' : 'text-yellow-600'}`}>
              {calcOverall(editOffRatings, editDefRatings) > 0 ? calcOverall(editOffRatings, editDefRatings).toFixed(1) : '—'}
            </span>
          </div>
        )}

        {/* Mejores / a trabajar */}
        {!isEditing && allRatings.length > 0 && (
          <div data-pdf-section className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-green-700 text-sm mb-3">Mejores conceptos</h3>
              <div className="space-y-2">
                {topConcepts.map(r => {
                  const c = getConceptById(r.conceptId);
                  return (
                    <div key={r.conceptId} className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-700 flex-1">{c?.label ?? r.conceptId}</p>
                      <StarRating value={r.rating} readonly size={13} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-amber-700 text-sm mb-3">Conceptos a trabajar</h3>
              <div className="space-y-2">
                {bottomConcepts.map(r => {
                  const c = getConceptById(r.conceptId);
                  return (
                    <div key={r.conceptId} className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-700 flex-1">{c?.label ?? r.conceptId}</p>
                      <StarRating value={r.rating} readonly size={13} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p data-pdf-section className="text-center text-xs text-gray-400 py-2">
          Análisis generado por XMP Football Analysis · {formatDate(analysis.createdAt)}
        </p>

      </div>{/* end pdf content */}

      {/* ── Delete confirmation dialog ── */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Eliminar análisis"
          message={`¿Seguro que quieres eliminar el análisis del ${formatDate(analysis.date)} de ${player.name}? Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          onConfirm={() => {
            deleteAnalysis(analysis.id);
            navigate(`/players/${player.id}`);
          }}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}

// ── Helper components ────────────────────────────────────────────────────────

function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#1A3A5C] text-base">{title}</h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-blue-300 text-[10px] flex items-center gap-1 uppercase tracking-wide">{icon}{label}</p>
      <p className="text-white text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function RatingSection({ title, ratings, color }: {
  title: string; ratings: ConceptRating[]; color: 'orange' | 'navy';
}) {
  const evaluated = ratings.filter(r => r.rating > 0);
  if (evaluated.length === 0) return null;
  const headerColor = color === 'orange' ? 'text-[#D67D2E]' : 'text-[#1A3A5C]';
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className={`font-bold ${headerColor} text-sm uppercase tracking-wide mb-4`}>{title}</h2>
      <div className="space-y-3">
        {evaluated.map(r => {
          const concept = getConceptById(r.conceptId);
          return (
            <div key={r.conceptId} className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A3A5C]">{concept?.label ?? r.conceptId}</p>
                {r.note && <p className="text-xs text-gray-500 mt-0.5 italic">"{r.note}"</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StarRating value={r.rating} readonly size={15} />
                <span className={`text-xs font-bold w-5 text-center ${r.rating >= 4 ? 'text-green-600' : r.rating >= 3 ? 'text-blue-600' : r.rating >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {r.rating}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditRatingsSection({ title, concepts, ratings, onRate, color }: {
  title: string;
  concepts: { id: string; label: string; description?: string }[];
  ratings: ConceptRating[];
  onRate: (id: string, val: number) => void;
  color: 'orange' | 'navy';
}) {
  const headerColor = color === 'orange' ? 'text-[#D67D2E]' : 'text-[#1A3A5C]';
  const rated = ratings.filter(r => r.rating > 0).length;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-bold ${headerColor} text-sm uppercase tracking-wide`}>{title}</h2>
        <span className="text-xs text-gray-400">{rated} / {concepts.length} valorados</span>
      </div>
      <div className="space-y-2">
        {concepts.map(c => {
          const currentRating = ratings.find(r => r.conceptId === c.id)?.rating ?? 0;
          return (
            <div key={c.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${currentRating > 0 ? (color === 'orange' ? 'bg-orange-50 border border-orange-100' : 'bg-blue-50 border border-blue-100') : 'bg-gray-50 border border-transparent'}`}>
              <p className="flex-1 text-sm text-gray-700">{c.label}</p>
              <StarRating value={currentRating} onChange={v => onRate(c.id, v)} size={18} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
