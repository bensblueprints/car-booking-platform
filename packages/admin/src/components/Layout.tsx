import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from '../lib/api';
import { Car, Calendar, Users, Star, LayoutGrid, MapPin, Tag, Settings, LogOut } from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/fleet', label: 'Fleet', icon: Car },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/locations', label: 'Locations', icon: MapPin },
  { to: '/bookings', label: 'Bookings', icon: Calendar },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const nav2 = useNavigate();
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r border-border bg-surface/50 p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2 py-3 mb-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center font-display font-bold">B</div>
          <div>
            <div className="font-display font-bold text-sm leading-tight">Bargain</div>
            <div className="text-[10px] text-muted uppercase tracking-wider">Admin Console</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text hover:bg-bg'
                }`
              }
            >
              <n.icon size={16} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="mt-8 flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted hover:text-text w-full"
          onClick={() => {
            clearToken();
            nav2('/login');
          }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </aside>
      <main className="p-6 max-w-[1400px]">
        <Outlet />
      </main>
    </div>
  );
}
