import type { Player, Analysis, ConceptRating, MatchInfo } from '../types';

// ---- DB row shapes (snake_case as Supabase returns them) ----

interface DbPlayer {
  id: string;
  name: string;
  photo_url: string | null;
  team: string;
  position: string;
  side: string | null;
  age: number | null;
  nationality: string | null;
  email: string | null;
  phone: string | null;
  trial_start_date: string;
  subscription_status: string;
  notes: string | null;
  created_at: string;
}

interface DbAnalysis {
  id: string;
  player_id: string;
  date: string;
  match_info: MatchInfo;
  video_url: string | null;
  phase: string;
  offensive_ratings: ConceptRating[];
  defensive_ratings: ConceptRating[];
  general_observations: string | null;
  strengths: string[];
  improvements: string[];
  next_match_focus: string | null;
  overall_rating: number;
  created_at: string;
}

// ---- Mappers: DB → App ----

export function fromDbPlayer(db: DbPlayer): Player {
  return {
    id: db.id,
    name: db.name,
    photoUrl: db.photo_url ?? undefined,
    team: db.team,
    position: db.position as Player['position'],
    side: (db.side as Player['side']) ?? undefined,
    age: db.age ?? undefined,
    nationality: db.nationality ?? undefined,
    email: db.email ?? undefined,
    phone: db.phone ?? undefined,
    trialStartDate: db.trial_start_date,
    subscriptionStatus: db.subscription_status as Player['subscriptionStatus'],
    notes: db.notes ?? undefined,
    createdAt: db.created_at,
  };
}

export function toDbPlayer(p: Player): Omit<DbPlayer, 'created_at'> {
  return {
    id: p.id,
    name: p.name,
    photo_url: p.photoUrl ?? null,
    team: p.team,
    position: p.position,
    side: p.side ?? null,
    age: p.age ?? null,
    nationality: p.nationality ?? null,
    email: p.email ?? null,
    phone: p.phone ?? null,
    trial_start_date: p.trialStartDate,
    subscription_status: p.subscriptionStatus,
    notes: p.notes ?? null,
  };
}

export function fromDbAnalysis(db: DbAnalysis): Analysis {
  return {
    id: db.id,
    playerId: db.player_id,
    date: db.date,
    matchInfo: db.match_info ?? {},
    videoUrl: db.video_url ?? undefined,
    phase: db.phase as Analysis['phase'],
    offensiveRatings: db.offensive_ratings ?? [],
    defensiveRatings: db.defensive_ratings ?? [],
    generalObservations: db.general_observations ?? undefined,
    strengths: db.strengths ?? [],
    improvements: db.improvements ?? [],
    nextMatchFocus: db.next_match_focus ?? '',
    overallRating: Number(db.overall_rating),
    createdAt: db.created_at,
  };
}

export function toDbAnalysis(a: Analysis): Omit<DbAnalysis, 'created_at'> {
  return {
    id: a.id,
    player_id: a.playerId,
    date: a.date,
    match_info: a.matchInfo,
    video_url: a.videoUrl ?? null,
    phase: a.phase,
    offensive_ratings: a.offensiveRatings,
    defensive_ratings: a.defensiveRatings,
    general_observations: a.generalObservations ?? null,
    strengths: a.strengths,
    improvements: a.improvements,
    next_match_focus: a.nextMatchFocus || null,
    overall_rating: a.overallRating,
  };
}

// ---- Image compression helper ----

export function compressImage(dataUrl: string, maxSize = 400, quality = 0.75): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}
