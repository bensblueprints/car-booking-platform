import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Calendar } from 'lucide-react';
import { api } from '../lib/api';

export default function Fleet() {
  const { data: cars, isLoading } = useQuery({ queryKey: ['admin-cars'], queryFn: () => api.admin.cars() });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display">Fleet</h1>
        <Link to="/fleet/new" className="btn-primary"><Plus size={16} /> Add car</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted uppercase tracking-wider">
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">Car</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-left py-3 px-4">Daily</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Bookings</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="p-6 text-center text-muted">Loading…</td></tr>
            )}
            {cars?.map((c: any) => (
              <tr key={c.id} className="table-row">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {c.images?.[0] && <img src={c.images[0]} alt="" className="w-12 h-9 object-cover rounded" />}
                    <div>
                      <div className="font-medium">{c.year} {c.make} {c.model}</div>
                      <div className="text-xs text-muted">{c.trim ?? ''} {c.color ?? ''}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{c.category?.name}</td>
                <td className="py-3 px-4">${c.dailyRate}</td>
                <td className="py-3 px-4">
                  <span className={`badge ${c.status === 'active' ? 'badge-confirmed' : c.status === 'maintenance' ? 'badge-pending' : 'badge-cancelled'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/fleet/${c.id}/calendar`} className="inline-flex items-center gap-1 text-primary hover:underline">
                    <Calendar size={12} /> {c._count?.bookings ?? 0}
                  </Link>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Link to={`/fleet/${c.id}/calendar`} className="btn-ghost inline-flex" title="Calendar"><Calendar size={14} /></Link>
                    <Link to={`/fleet/${c.id}`} className="btn-ghost inline-flex" title="Edit"><Pencil size={14} /></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
