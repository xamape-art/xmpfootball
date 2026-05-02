import { useState } from 'react';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Introduce email y contraseña'); return; }
    setError('');
    setLoading(true);
    const err = await signIn(email.trim().toLowerCase(), password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1A3A5C] flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <div className="mb-8">
        <Logo variant="white" size="lg" />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-xl font-bold text-[#1A3A5C] mb-1">Iniciar sesión</h1>
        <p className="text-sm text-gray-400 mb-7">Accede a tu panel de análisis</p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="tu@email.com"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/25 focus:border-[#1A3A5C] transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/25 focus:border-[#1A3A5C] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#D67D2E] hover:bg-[#c06a1f] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Entrando…</>
              : <><LogIn size={16} /> Iniciar sesión</>
            }
          </button>
        </form>
      </div>

      <p className="mt-6 text-blue-300/60 text-xs">XMP Football Analysis · Acceso restringido</p>
    </div>
  );
}
