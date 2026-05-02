import { useState, useEffect } from 'react';
import type { Player, Analysis } from '../types';

const PLAYERS_KEY = 'xmp_players';
const ANALYSES_KEY = 'xmp_analyses';

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>(() => load<Player>(PLAYERS_KEY));

  const addPlayer = (player: Player) => {
    const updated = [...players, player];
    setPlayers(updated);
    save(PLAYERS_KEY, updated);
  };

  const updatePlayer = (id: string, data: Partial<Player>) => {
    const updated = players.map(p => p.id === id ? { ...p, ...data } : p);
    setPlayers(updated);
    save(PLAYERS_KEY, updated);
  };

  const deletePlayer = (id: string) => {
    const updated = players.filter(p => p.id !== id);
    setPlayers(updated);
    save(PLAYERS_KEY, updated);
  };

  const getPlayer = (id: string) => players.find(p => p.id === id);

  return { players, addPlayer, updatePlayer, deletePlayer, getPlayer };
}

export function useAnalyses() {
  const [analyses, setAnalyses] = useState<Analysis[]>(() => load<Analysis>(ANALYSES_KEY));

  const addAnalysis = (analysis: Analysis) => {
    const updated = [...analyses, analysis];
    setAnalyses(updated);
    save(ANALYSES_KEY, updated);
  };

  const updateAnalysis = (id: string, data: Partial<Analysis>) => {
    const updated = analyses.map(a => a.id === id ? { ...a, ...data } : a);
    setAnalyses(updated);
    save(ANALYSES_KEY, updated);
  };

  const deleteAnalysis = (id: string) => {
    const updated = analyses.filter(a => a.id !== id);
    setAnalyses(updated);
    save(ANALYSES_KEY, updated);
  };

  const getAnalysesByPlayer = (playerId: string) =>
    analyses.filter(a => a.playerId === playerId).sort((a, b) => b.date.localeCompare(a.date));

  const getAnalysis = (id: string) => analyses.find(a => a.id === id);

  return { analyses, addAnalysis, updateAnalysis, deleteAnalysis, getAnalysesByPlayer, getAnalysis };
}

export function useAppData() {
  const players = usePlayers();
  const analyses = useAnalyses();
  return { ...players, ...analyses };
}

// Persist sync across tabs
export function useSyncedPlayers() {
  const [players, setPlayers] = useState<Player[]>(() => load<Player>(PLAYERS_KEY));

  useEffect(() => {
    const handler = () => setPlayers(load<Player>(PLAYERS_KEY));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return players;
}
