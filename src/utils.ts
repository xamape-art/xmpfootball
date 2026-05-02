export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function daysAgo(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function trialDaysLeft(trialStartDate: string, trialDays = 30): number {
  return Math.max(0, trialDays - daysAgo(trialStartDate));
}

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

export function getYouTubeThumbnail(url: string): string | null {
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) return null;
  const videoId = embedUrl.split('/embed/')[1];
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function ratingLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: 'Muy baja',
    2: 'Baja',
    3: 'Media',
    4: 'Alta',
    5: 'Muy alta',
  };
  return labels[rating] ?? 'Sin evaluar';
}

export function ratingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 3.5) return 'text-blue-600';
  if (rating >= 2.5) return 'text-yellow-600';
  if (rating >= 1.5) return 'text-orange-600';
  return 'text-red-600';
}

export function ratingBg(rating: number): string {
  if (rating >= 4.5) return 'bg-green-100 text-green-800';
  if (rating >= 3.5) return 'bg-blue-100 text-blue-800';
  if (rating >= 2.5) return 'bg-yellow-100 text-yellow-800';
  if (rating >= 1.5) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

export function avg(ratings: number[]): number {
  if (!ratings.length) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

export function positionLabel(position: string): string {
  return position === 'delantera' ? 'Delantera' : 'Extremo';
}

export function phaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    ofensivo: 'Ofensivo',
    defensivo: 'Defensivo',
    ambos: 'Ofensivo + Defensivo',
  };
  return labels[phase] ?? phase;
}
