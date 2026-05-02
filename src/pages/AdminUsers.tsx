import { useEffect, useState } from 'react';
import { UserPlus, Trash2, ShieldCheck, Eye, RefreshCw, Copy, Check, Loader2, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../store/AuthContext';

const ADMIN_EMAIL = 'xamape@gmail.com';

interface AppUser {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

function generatePassword() {
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$';
  const all = upper + lower + digits + special;
  const rand = (s: string) => s[Math.floor(Math.random() * s.length)];
  const base = [rand(upper), rand(lower), rand(digits), rand(special),
    ...Array.from({ length: 6 }, () => rand(all))];
  return base.sort(() => Math.random() - 0.5).join('');
}

export default function AdminUsers() {
  useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [copied, setCopied] = useState(false);

  // delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('app_users')
      .select('id, email, display_name, created_at')
      .order('created_at', { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email || !password) { setFormError('Email y contraseña son obligatorios'); return; }
    if (password.length < 6) { setFormError('La contraseña debe tener al menos 6 caracteres'); return; }
    setFormError('');
    setCreating(true);

    const { data, error } = await supabase.functions.invoke('create-app-user', {
      body: {
        email: email.trim().toLowerCase(),
        password,
        display_name: name.trim() || null,
      },
    });

    if (error || data?.error) {
      setFormError(data?.error ?? error?.message ?? 'Error al crear el usuario');
      setCreating(false);
      return;
    }

    setEmail('');
    setName('');
    setPassword('');
    setShowForm(false);
    setCreating(false);
    loadUsers();
  };

  const handleDelete = async (id: string, userEmail: string) => {
    if (!confirm(`¿Eliminar acceso a ${userEmail}? La jugadora no podrá entrar a la app.`)) return;
    setDeletingId(id);
    await supabase.from('app_users').delete().eq('id', id);
    setDeletingId(null);
    loadUsers();
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3A5C]">Gestión de usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Crea y gestiona el acceso de las jugadoras</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setFormError(''); }}
          className="inline-flex items-center gap-2 bg-[#D67D2E] text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-[#c06a1f] transition-colors shadow-sm"
        >
          <UserPlus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-[#1A3A5C] mb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-[#D67D2E]" /> Crear nuevo acceso
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jugadora@email.com"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nombre (opcional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nombre de la jugadora"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Contraseña *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setPassword(generatePassword())}
                  title="Generar contraseña"
                  className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-[#1A3A5C]"
                >
                  <RefreshCw size={15} />
                </button>
                {password && (
                  <button
                    type="button"
                    onClick={copyPassword}
                    title="Copiar contraseña"
                    className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-[#1A3A5C]"
                  >
                    {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                  </button>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Usa el botón para generar una contraseña segura y cópiala antes de guardar.</p>
            </div>

            {formError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{formError}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1A3A5C] text-white text-sm font-medium rounded-xl hover:bg-[#162f4a] disabled:opacity-60 transition-colors"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                {creating ? 'Creando…' : 'Crear usuario'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin row (always shown) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Usuarios activos</span>
          <span className="text-xs text-gray-400">{users.length + 1} total</span>
        </div>

        {/* Admin fixed row */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 bg-[#1A3A5C]/3">
          <div className="w-9 h-9 rounded-full bg-[#D67D2E] flex items-center justify-center shrink-0">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1A3A5C] truncate">{ADMIN_EMAIL}</p>
            <p className="text-xs text-gray-400">Administrador · Acceso total</p>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#D67D2E]/10 text-[#D67D2E]">ADMIN</span>
        </div>

        {/* Users list */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10">
            <Users size={28} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">Sin jugadoras registradas todavía</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Eye size={14} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A3A5C] truncate">{u.email}</p>
                  <p className="text-xs text-gray-400">
                    {u.display_name ? `${u.display_name} · ` : ''}
                    Alta: {shortDate(u.created_at)}
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 shrink-0">LECTOR</span>
                <button
                  onClick={() => handleDelete(u.id, u.email)}
                  disabled={deletingId === u.id}
                  className="p-2 rounded-lg text-red-300 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  {deletingId === u.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note about Supabase email confirmation */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 text-xs text-amber-800">
        <p className="font-semibold mb-1">Requisito de configuración en Supabase</p>
        <p>Para que los usuarios puedan acceder sin confirmar su email, desactiva la confirmación en:<br />
        <span className="font-mono">Supabase → Authentication → Providers → Email → "Confirm email" → OFF</span></p>
      </div>
    </div>
  );
}
