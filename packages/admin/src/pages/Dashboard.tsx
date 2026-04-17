import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Car, Calendar, DollarSign, Users, Star, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['stats'], queryFn: () => api.admin.stats() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Dashboard</h1>
        <p className="text-muted text-sm">Live overview of fleet, bookings and revenue.</p>
      </div>

      {isLoading && <div className="text-muted">Loading…</div>}

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat icon={Car} label="Active fleet" value={`${stats.fleet.active}/${stats.fleet.total}`} />
            <Stat icon={Calendar} label="Pending bookings" value={stats.bookings.pending} accent />
            <Stat icon={DollarSign} label="Revenue (30d)" value={`$${stats.revenue.last30.toLocaleString()}`} />
            <Stat icon={Users} label="Customers" value={stats.customers} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h2 className="font-display text-lg mb-3 flex items-center gap-2"><TrendingUp size={18} /> Booking status</h2>
              <ul className="text-sm space-y-2">
                <li className="flex justify-between"><span>Pending</span><span className="font-semibold">{stats.bookings.pending}</span></li>
                <li className="flex justify-between"><span>Confirmed</span><span className="font-semibold">{stats.bookings.confirmed}</span></li>
                <li className="flex justify-between"><span>Completed</span><span className="font-semibold">{stats.bookings.completed}</span></li>
                <li className="flex justify-between"><span>Total</span><span className="font-semibold">{stats.bookings.total}</span></li>
              </ul>
            </div>
            <div className="card p-5">
              <h2 className="font-display text-lg mb-3 flex items-center gap-2"><Star size={18} /> Moderation queue</h2>
              <div className="text-3xl font-display text-accent">{stats.pendingReviews}</div>
              <div className="text-xs text-muted">reviews awaiting approval</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <TodayList title="Today's pickups" items={stats.today.pickups} empty="No pickups scheduled today." />
            <TodayList title="Today's returns" items={stats.today.dropoffs} empty="No returns scheduled today." />
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: any) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-muted text-xs uppercase tracking-wide mb-2">
        <Icon size={14} /> {label}
      </div>
      <div className={`text-2xl font-display ${accent ? 'text-accent' : ''}`}>{value}</div>
    </div>
  );
}

function TodayList({ title, items, empty }: { title: string; items: any[]; empty: string }) {
  return (
    <div className="card p-5">
      <h2 className="font-display text-lg mb-3">{title}</h2>
      {items.length === 0 ? (
        <div className="text-muted text-sm">{empty}</div>
      ) : (
        <ul className="divide-y divide-border text-sm">
          {items.map((b) => (
            <li key={b.id} className="py-2 flex justify-between items-center">
              <div>
                <div className="font-medium">{b.user.firstName} {b.user.lastName}</div>
                <div className="text-xs text-muted">{b.car.year} {b.car.make} {b.car.model}</div>
              </div>
              <a href={`/bookings/${b.id}`} className="text-primary text-xs hover:underline">View</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
