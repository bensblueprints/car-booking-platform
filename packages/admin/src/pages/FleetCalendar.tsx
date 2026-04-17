import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/30 border-yellow-500/60',
  confirmed: 'bg-primary/40 border-primary/80',
  in_progress: 'bg-blue-500/40 border-blue-500/80',
  completed: 'bg-emerald-500/30 border-emerald-500/60',
  cancelled: 'bg-gray-500/20 border-gray-500/40',
  refunded: 'bg-gray-500/20 border-gray-500/40',
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function buildMonthGrid(anchor: Date) {
  // Returns an array of 42 dates (6 weeks) starting from the Sunday before the 1st.
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return { first, days };
}

export default function FleetCalendar() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));

  const carQ = useQuery({ queryKey: ['admin-car', id], queryFn: () => api.admin.cars().then((cs) => cs.find((c: any) => c.id === id)), enabled: !!id });
  const bookingsQ = useQuery({ queryKey: ['admin-car-bookings', id], queryFn: () => api.admin.carBookings(id!), enabled: !!id });

  const { first, days } = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const monthLabel = anchor.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  // Map date key (YYYY-MM-DD) → list of bookings that cover that day
  const dayToBookings = useMemo(() => {
    const m = new Map<string, any[]>();
    if (!bookingsQ.data) return m;
    for (const b of bookingsQ.data) {
      if (b.status === 'cancelled' || b.status === 'refunded') continue;
      const s = startOfDay(new Date(b.startDate));
      const e = startOfDay(new Date(b.endDate));
      for (let d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
        const k = d.toISOString().slice(0, 10);
        const list = m.get(k) ?? [];
        list.push(b);
        m.set(k, list);
      }
    }
    return m;
  }, [bookingsQ.data]);

  const car = carQ.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link to="/fleet" className="text-xs text-muted hover:text-primary">← Fleet</Link>
          <h1 className="text-3xl font-display">
            {car ? `${car.year} ${car.make} ${car.model}` : 'Loading…'}
          </h1>
          <div className="text-xs text-muted mt-1">Booking calendar</div>
        </div>
        <div className="flex gap-2">
          <Link to={`/fleet/${id}`} className="btn text-sm px-3 py-1 bg-surface border border-border rounded">Edit car</Link>
          <button
            onClick={() => nav(`/bookings/new?carId=${id}`)}
            className="btn text-sm px-3 py-1 bg-primary text-white rounded"
          >
            + Book this car
          </button>
        </div>
      </div>

      <div className="card p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setAnchor(addMonths(anchor, -1))} className="btn text-sm px-3 py-1 bg-surface border border-border rounded">← Prev</button>
          <div className="font-display text-lg">{monthLabel}</div>
          <button onClick={() => setAnchor(addMonths(anchor, 1))} className="btn text-sm px-3 py-1 bg-surface border border-border rounded">Next →</button>
        </div>

        <div className="grid grid-cols-7 text-xs text-muted uppercase tracking-wider text-center">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const inMonth = d.getMonth() === first.getMonth();
            const key = d.toISOString().slice(0, 10);
            const bookings = dayToBookings.get(key) ?? [];
            const topStatus = bookings[0]?.status;
            const color = topStatus ? STATUS_COLORS[topStatus] ?? '' : '';
            const isToday = key === new Date().toISOString().slice(0, 10);
            return (
              <div
                key={key}
                className={`relative min-h-[70px] p-1.5 border rounded text-xs ${
                  inMonth ? 'border-border bg-surface/40' : 'border-border/30 bg-surface/10 text-muted'
                } ${color}`}
              >
                <div className={`text-[11px] ${isToday ? 'font-bold text-primary' : ''}`}>{d.getDate()}</div>
                <div className="mt-1 space-y-0.5">
                  {bookings.slice(0, 2).map((b) => (
                    <Link
                      key={b.id}
                      to={`/bookings/${b.id}`}
                      className="block text-[10px] truncate hover:underline"
                      title={`${b.user.firstName} ${b.user.lastName} · ${b.status}`}
                    >
                      {b.user.firstName} {b.user.lastName?.[0]}.
                    </Link>
                  ))}
                  {bookings.length > 2 && <div className="text-[10px] text-muted">+{bookings.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-border text-xs">
          {Object.entries(STATUS_COLORS).map(([s, c]) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={`inline-block w-3 h-3 rounded ${c} border`} />
              <span className="capitalize">{s.replace('_', ' ')}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="card p-4 md:p-6">
        <h2 className="font-display text-xl mb-3">All bookings</h2>
        {bookingsQ.isLoading && <div className="text-muted text-sm">Loading…</div>}
        {bookingsQ.data?.length === 0 && <div className="text-muted text-sm">No bookings for this car yet.</div>}
        <div className="divide-y divide-border">
          {bookingsQ.data?.map((b: any) => (
            <Link
              key={b.id}
              to={`/bookings/${b.id}`}
              className="flex items-center justify-between py-2.5 hover:bg-surface/40 rounded px-2 -mx-2"
            >
              <div>
                <div className="text-sm font-medium">{b.user.firstName} {b.user.lastName}</div>
                <div className="text-xs text-muted">
                  {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded border ${STATUS_COLORS[b.status] ?? ''}`}>{b.status.replace('_', ' ')}</span>
                <span className="text-sm font-semibold">${Number(b.totalAmount).toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
