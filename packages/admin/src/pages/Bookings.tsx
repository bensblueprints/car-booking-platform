import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { format } from 'date-fns';
import { api } from '../lib/api';

const statuses = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'];

export default function Bookings() {
  const [status, setStatus] = useState('all');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', status],
    queryFn: () => api.admin.bookings(status === 'all' ? undefined : status),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display">Bookings</h1>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`btn text-xs px-3 py-1 ${status === s ? 'bg-primary text-white' : 'bg-surface border border-border'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="text-xs text-muted uppercase tracking-wider">
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">When</th>
              <th className="text-left py-3 px-4">Customer</th>
              <th className="text-left py-3 px-4">Car</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted">Loading…</td></tr>}
            {data?.map((b: any) => (
              <tr key={b.id} className="table-row">
                <td className="py-3 px-4">
                  <div className="text-xs">{format(new Date(b.startDate), 'MMM d')} → {format(new Date(b.endDate), 'MMM d, yyyy')}</div>
                  <div className="text-[10px] text-muted">{b.days}d</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{b.user.firstName} {b.user.lastName}</div>
                  <div className="text-xs text-muted">{b.user.email}</div>
                </td>
                <td className="py-3 px-4">{b.car.year} {b.car.make} {b.car.model}</td>
                <td className="py-3 px-4"><span className={`badge-${b.status}`}>{b.status.replace('_', ' ')}</span></td>
                <td className="py-3 px-4 font-semibold">${Number(b.totalAmount).toFixed(2)}</td>
                <td className="py-3 px-4 text-right"><Link to={`/bookings/${b.id}`} className="text-primary hover:underline text-xs">Open →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
