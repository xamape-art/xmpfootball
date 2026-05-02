import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Save, Loader2 } from 'lucide-react';
import { usePlayers } from '../store/AppContext';
import { generateId } from '../utils';
import { compressImage } from '../lib/db';
import type { Player } from '../types';

export default function PlayerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addPlayer, updatePlayer, getPlayer } = usePlayers();
  const existing = id && id !== 'new' ? getPlayer(id) : undefined;
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Omit<Player, 'id' | 'createdAt'>>({
    name: existing?.name ?? '',
    team: existing?.team ?? '',
    position: existing?.position ?? 'delantera',
    side: existing?.side ?? undefined,
    age: existing?.age ?? undefined,
    nationality: existing?.nationality ?? '',
    email: existing?.email ?? '',
    phone: existing?.phone ?? '',
    photoUrl: existing?.photoUrl ?? '',
    trialStartDate: existing?.trialStartDate ?? new Date().toISOString().split('T')[0],
    subscriptionStatus: existing?.subscriptionStatus ?? 'trial',
    notes: existing?.notes ?? '',
  });

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }));
    };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const compressed = await compressImage(ev.target?.result as string);
      setForm(prev => ({ ...prev, photoUrl: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (existing) {
        await updatePlayer(existing.id, form);
        navigate(`/players/${existing.id}`);
      } else {
        const player: Player = { ...form, id: generateId(), createdAt: new Date().toISOString() };
        await addPlayer(player);
        navigate(`/players/${player.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1A3A5C]">{existing ? 'Editar jugadora' : 'Nueva jugadora'}</h1>
          <p className="text-gray-500 text-sm">Rellena los datos del perfil</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Photo */}
        <div className="flex items-center gap-5">
          <div className="relative">
            {form.photoUrl ? (
              <img src={form.photoUrl} alt="Foto" className="w-20 h-20 rounded-full object-cover border-4 border-gray-100" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#1A3A5C] flex items-center justify-center text-white text-2xl font-bold">
                {form.name ? form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#D67D2E] rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#c06a1f]"
            >
              <Camera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-700">Foto de perfil</p>
            <p className="text-xs text-gray-400">JPG, PNG o WebP · se comprime automáticamente</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre completo *" required>
            <input type="text" required value={form.name} onChange={set('name')} placeholder="Ej: Ana García López" className={inputCls} />
          </Field>
          <Field label="Equipo *" required>
            <input type="text" required value={form.team} onChange={set('team')} placeholder="Ej: Athletic Club" className={inputCls} />
          </Field>
          <Field label="Posición *">
            <select required value={form.position} onChange={set('position')} className={inputCls}>
              <option value="delantera">Delantera</option>
              <option value="extremo">Extremo</option>
            </select>
          </Field>
          <Field label="Lado">
            <select value={form.side ?? ''} onChange={set('side')} className={inputCls}>
              <option value="">Sin especificar</option>
              <option value="derecha">Derecha</option>
              <option value="izquierda">Izquierda</option>
              <option value="ambos">Ambos</option>
            </select>
          </Field>
          <Field label="Edad">
            <input type="number" min="14" max="50" value={form.age ?? ''} onChange={set('age')} placeholder="25" className={inputCls} />
          </Field>
          <Field label="Nacionalidad">
            <input type="text" value={form.nationality} onChange={set('nationality')} placeholder="Ej: Española" className={inputCls} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={set('email')} placeholder="jugadora@email.com" className={inputCls} />
          </Field>
          <Field label="Teléfono">
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+34 600 000 000" className={inputCls} />
          </Field>
          <Field label="Inicio del periodo de prueba">
            <input type="date" value={form.trialStartDate} onChange={set('trialStartDate')} className={inputCls} />
          </Field>
          <Field label="Estado suscripción">
            <select value={form.subscriptionStatus} onChange={set('subscriptionStatus')} className={inputCls}>
              <option value="trial">En prueba</option>
              <option value="active">Activa (pago)</option>
              <option value="inactive">Inactiva</option>
            </select>
          </Field>
        </div>

        <Field label="Notas internas">
          <textarea
            value={form.notes}
            onChange={set('notes')}
            rows={3}
            placeholder="Observaciones generales, historial, lesiones previas..."
            className={inputCls + ' resize-none'}
          />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#1A3A5C] text-white rounded-xl hover:bg-[#162f4a] shadow-sm disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Guardando…' : existing ? 'Guardar cambios' : 'Crear jugadora'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20 focus:border-[#1A3A5C] transition-colors bg-white';
