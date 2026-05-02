import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { fromDbPlayer, toDbPlayer, fromDbAnalysis, toDbAnalysis } from '../lib/db';
import type { Player, Analysis } from '../types';

interface AppState {
  players: Player[];
  analyses: Analysis[];
  loadingPlayers: boolean;
  loadingAnalyses: boolean;
  addPlayer: (p: Player) => Promise<void>;
  updatePlayer: (id: string, data: Partial<Player>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  getPlayer: (id: string) => Player | undefined;
  addAnalysis: (a: Analysis) => Promise<void>;
  updateAnalysis: (id: string, data: Partial<Analysis>) => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
  getAnalysis: (id: string) => Analysis | undefined;
  getAnalysesByPlayer: (playerId: string) => Analysis[];
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);

  useEffect(() => {
    loadPlayers();
    loadAnalyses();
  }, []);

  async function loadPlayers() {
    setLoadingPlayers(true);
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });
    setPlayers((data ?? []).map(fromDbPlayer));
    setLoadingPlayers(false);
  }

  async function loadAnalyses() {
    setLoadingAnalyses(true);
    const { data } = await supabase
      .from('analyses')
      .select('*')
      .order('date', { ascending: false });
    setAnalyses((data ?? []).map(fromDbAnalysis));
    setLoadingAnalyses(false);
  }

  const addPlayer = async (player: Player) => {
    const { data, error } = await supabase
      .from('players')
      .insert(toDbPlayer(player))
      .select()
      .single();
    if (!error && data) setPlayers(prev => [fromDbPlayer(data), ...prev]);
    if (error) throw new Error(error.message);
  };

  const updatePlayer = async (id: string, update: Partial<Player>) => {
    const existing = players.find(p => p.id === id);
    if (!existing) return;
    const merged = { ...existing, ...update };
    const { data, error } = await supabase
      .from('players')
      .update(toDbPlayer(merged))
      .eq('id', id)
      .select()
      .single();
    if (!error && data) setPlayers(prev => prev.map(p => p.id === id ? fromDbPlayer(data) : p));
  };

  const deletePlayer = async (id: string) => {
    // Optimistic update
    setPlayers(prev => prev.filter(p => p.id !== id));
    setAnalyses(prev => prev.filter(a => a.playerId !== id));
    await supabase.from('players').delete().eq('id', id);
  };

  const getPlayer = useCallback(
    (id: string) => players.find(p => p.id === id),
    [players]
  );

  const addAnalysis = async (analysis: Analysis) => {
    const { data, error } = await supabase
      .from('analyses')
      .insert(toDbAnalysis(analysis))
      .select()
      .single();
    if (!error && data) setAnalyses(prev => [fromDbAnalysis(data), ...prev]);
    if (error) throw new Error(error.message);
  };

  const updateAnalysis = async (id: string, update: Partial<Analysis>) => {
    const existing = analyses.find(a => a.id === id);
    if (!existing) return;
    const merged = { ...existing, ...update };
    const { data, error } = await supabase
      .from('analyses')
      .update(toDbAnalysis(merged))
      .eq('id', id)
      .select()
      .single();
    if (!error && data) setAnalyses(prev => prev.map(a => a.id === id ? fromDbAnalysis(data) : a));
  };

  const deleteAnalysis = async (id: string) => {
    // Optimistic update
    setAnalyses(prev => prev.filter(a => a.id !== id));
    await supabase.from('analyses').delete().eq('id', id);
  };

  const getAnalysis = useCallback(
    (id: string) => analyses.find(a => a.id === id),
    [analyses]
  );

  const getAnalysesByPlayer = useCallback(
    (playerId: string) =>
      analyses
        .filter(a => a.playerId === playerId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [analyses]
  );

  return (
    <AppContext.Provider value={{
      players, analyses, loadingPlayers, loadingAnalyses,
      addPlayer, updatePlayer, deletePlayer, getPlayer,
      addAnalysis, updateAnalysis, deleteAnalysis, getAnalysis, getAnalysesByPlayer,
    }}>
      {children}
    </AppContext.Provider>
  );
}

function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

// Same API as old useStore hooks — pages need zero changes
export function usePlayers() {
  const { players, loadingPlayers, addPlayer, updatePlayer, deletePlayer, getPlayer } = useApp();
  return { players, loading: loadingPlayers, addPlayer, updatePlayer, deletePlayer, getPlayer };
}

export function useAnalyses() {
  const { analyses, loadingAnalyses, addAnalysis, updateAnalysis, deleteAnalysis, getAnalysis, getAnalysesByPlayer } = useApp();
  return { analyses, loading: loadingAnalyses, addAnalysis, updateAnalysis, deleteAnalysis, getAnalysis, getAnalysesByPlayer };
}
