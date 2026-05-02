import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Trash2, Calendar, MapPin, Trophy, Video, CheckCircle, ArrowUpCircle, Target, Star, Download, Loader2 } from 'lucide-react';
import { useAnalyses, usePlayers } from '../store/AppContext';
import { getConceptById } from '../data/concepts';
import { formatDate, getYouTubeEmbedUrl, phaseLabel } from '../utils';
import { PlayerAvatar } from './Dashboard';
import StarRating from '../components/StarRating';
import Logo from '../components/Logo';
import type { ConceptRating } from '../types';

export default function AnalysisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAnalysis, deleteAnalysis } = useAnalyses();
  const { getPlayer } = usePlayers();

  const analysis = getAnalysis(id!);
  const player = analysis ? getPlayer(analysis.playerId) : undefined;

  if (!analysis || !player) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Análisis no encontrado</p>
        <Link to="/" className="text-[#D67D2E] text-sm hover:underline mt-2 inline-block">Volver al dashboard</Link>
      </div>
    );
  }

  const embedUrl = analysis.videoUrl ? getYouTubeEmbedUrl(analysis.videoUrl) : null;
  const allRatings = [
    ...analysis.offensiveRatings,
    ...analysis.defensiveRatings,
  ].filter(r => r.rating > 0);

  const topConcepts = [...allRatings].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const bottomConcepts = [...allRatings].sort((a, b) => a.rating - b.rating).slice(0, 3);

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const element = document.getElementById('pdf-content')!;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f0f4f8',
        logging: false,
        windowWidth: 900,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageW = pdf.internal.pageSize.getWidth();   // 210 mm
      const pageH = pdf.internal.pageSize.getHeight();  // 297 mm
      const margin = 10;
      const usableW = pageW - margin * 2;
      const imgH = (canvas.height * usableW) / canvas.width;

      let yOffset = 0;
      while (yOffset < imgH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, margin - (yOffset), usableW, imgH);
        yOffset += pageH - margin * 2;
      }

      const filename = `XMP_${player.name.replace(/\s+/g, '_')}_${analysis.date}.pdf`;
      pdf.save(filename);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = () => {
    if (confirm('¿Eliminar este análisis? Esta acción no se puede deshacer.')) {
      deleteAnalysis(analysis.id);
      navigate(`/players/${player.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="report-print">
      {/* Actions bar */}
      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1A3A5C]">
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="flex gap-2">
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
          <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 text-sm border border-red-200 rounded-xl hover:bg-red-50 text-red-500">
            <Trash2 size={15} /> Eliminar
          </button>
        </div>
      </div>

      {/* PDF capture area — todo lo que va dentro se imprime/descarga */}
      <div id="pdf-content" className="space-y-6">

      {/* Report header */}
      <div className="bg-[#1A3A5C] text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <PlayerAvatar name={player.name} photo={player.photoUrl} size="md" />
            <div>
              <p className="text-blue-300 text-xs font-medium uppercase tracking-wide mb-1">Informe de análisis individual</p>
              <h1 className="text-xl font-bold">{player.name}</h1>
              <p className="text-blue-200 text-sm">{player.team} · {player.position === 'delantera' ? 'Delantera' : 'Extremo'}</p>
            </div>
          </div>
          <div className="text-right">
            <Logo variant="white" size="sm" />
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoItem icon={<Calendar size={13} />} label="Fecha" value={formatDate(analysis.date)} />
          {analysis.matchInfo.opponent && <InfoItem icon={<Trophy size={13} />} label="Rival" value={analysis.matchInfo.opponent} />}
          {analysis.matchInfo.competition && <InfoItem icon={<Target size={13} />} label="Competición" value={analysis.matchInfo.competition} />}
          {analysis.matchInfo.result && <InfoItem icon={<Star size={13} />} label="Resultado" value={analysis.matchInfo.result} />}
          {analysis.matchInfo.venue && <InfoItem icon={<MapPin size={13} />} label="Sede" value={analysis.matchInfo.venue} />}
          <InfoItem icon={<Target size={13} />} label="Fase analizada" value={phaseLabel(analysis.phase)} />
        </div>
      </div>

      {/* Overall score */}
      <div className="grid grid-cols-3 gap-4">
        <ScoreCard label="Valoración global" value={analysis.overallRating.toFixed(1)} sub={<StarRating value={Math.round(analysis.overallRating)} readonly size={16} />} highlight />
        <ScoreCard label="Conceptos evaluados" value={allRatings.length} sub={`de ${analysis.offensiveRatings.length + analysis.defensiveRatings.length} totales`} />
        <ScoreCard label="Fase" value={phaseLabel(analysis.phase)} sub={formatDate(analysis.date)} />
      </div>

      {/* Video */}
      {embedUrl && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Video size={16} className="text-[#D67D2E]" />
            <h2 className="font-semibold text-[#1A3A5C] text-sm">Vídeo del partido</h2>
          </div>
          <div className="relative" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={embedUrl}
              title="Vídeo análisis"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Improvement report */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-[#1A3A5C] text-lg mb-5">Plan de mejora</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {/* Strengths */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-green-600" />
              <h3 className="font-semibold text-green-800 text-sm">Fortalezas</h3>
            </div>
            {analysis.strengths.length > 0 ? (
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

          {/* Improvements */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpCircle size={16} className="text-amber-600" />
              <h3 className="font-semibold text-amber-800 text-sm">Áreas de mejora</h3>
            </div>
            {analysis.improvements.length > 0 ? (
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

          {/* Focus */}
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-[#D67D2E]" />
              <h3 className="font-semibold text-[#D67D2E] text-sm">Foco próximo partido</h3>
            </div>
            {analysis.nextMatchFocus ? (
              <p className="text-sm font-medium text-[#1A3A5C] leading-relaxed">{analysis.nextMatchFocus}</p>
            ) : (
              <p className="text-xs text-gray-400">Sin definir</p>
            )}
          </div>
        </div>
      </div>

      {/* Concept ratings */}
      {analysis.offensiveRatings.length > 0 && (
        <RatingSection
          title="Conceptos Ofensivos"
          ratings={analysis.offensiveRatings}
          color="orange"
        />
      )}
      {analysis.defensiveRatings.length > 0 && (
        <RatingSection
          title="Conceptos Defensivos"
          ratings={analysis.defensiveRatings}
          color="navy"
        />
      )}

      {/* Top / Bottom */}
      {allRatings.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
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
              {bottomConcepts.filter(r => r.rating > 0).map(r => {
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

      {/* General observations */}
      {analysis.generalObservations && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h3 className="font-semibold text-[#1A3A5C] text-sm mb-2">Observaciones generales</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{analysis.generalObservations}</p>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 py-4">
        Análisis generado por XMP Football Analysis · {formatDate(analysis.createdAt)}
      </p>

      </div> {/* fin pdf-content */}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-blue-300 text-xs flex items-center gap-1">{icon}{label}</p>
      <p className="text-white text-sm font-semibold mt-0.5 truncate">{value}</p>
    </div>
  );
}

function ScoreCard({ label, value, sub, highlight }: { label: string; value: string | number; sub: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 text-center ${highlight ? 'bg-[#1A3A5C] text-white' : 'bg-white border border-gray-100 shadow-sm'}`}>
      <p className={`text-xs font-medium mb-1 ${highlight ? 'text-blue-300' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-3xl font-bold ${highlight ? 'text-[#D67D2E]' : 'text-[#1A3A5C]'}`}>{value}</p>
      <div className={`text-xs mt-1 ${highlight ? 'text-blue-300' : 'text-gray-400'}`}>{sub}</div>
    </div>
  );
}

function RatingSection({ title, ratings, color }: { title: string; ratings: ConceptRating[]; color: 'orange' | 'navy' }) {
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
                <span className={`text-xs font-bold w-6 text-center ${r.rating >= 4 ? 'text-green-600' : r.rating >= 3 ? 'text-blue-600' : r.rating >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
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
