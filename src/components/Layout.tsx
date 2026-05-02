import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Menu, X, ChevronRight } from 'lucide-react';
import Logo from './Logo';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/players', icon: Users, label: 'Jugadoras' },
  { to: '/reports', icon: BarChart3, label: 'Informes' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1A3A5C] text-white fixed top-0 left-0 h-full z-40">
        <div className="flex items-center justify-center py-6 px-4 border-b border-white/10">
          <Logo variant="white" size="md" />
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => {
            const active = loc.pathname === to || (to !== '/' && loc.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#D67D2E] text-white shadow-md'
                    : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <Icon size={18} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-blue-300 text-center">
            XMP Football Analysis<br />
            <span className="text-blue-400">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1A3A5C] text-white px-4 py-3 flex items-center justify-between">
        <Logo variant="white" size="sm" />
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-white/10">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#1A3A5C] text-white pt-16 px-3 space-y-1" onClick={e => e.stopPropagation()}>
            {nav.map(({ to, icon: Icon, label }) => {
              const active = loc.pathname === to || (to !== '/' && loc.pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active ? 'bg-[#D67D2E] text-white' : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
