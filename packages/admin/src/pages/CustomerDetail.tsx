import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { api } from '../lib/api';

export default function CustomerDetail() {
  const { id } = useParams();
  const { data: u } = useQuery({ queryKey: ['customer', id], queryFn: () => api.admin.customer(id!) });
  if (!u) return <div className="text-muted">Loading…</div>;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display">{u.firstName} {u.lastName}</h1>
        <Link to="/customers" className="btn-ghost">Back</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5 space-y-2 text-sm">
          <div><div className="text-xs text-muted">Email</div><div>{u.email}</div></div>
          <div><div className="text-xs text-muted">Phone</div><div>{u.phone ?? '—'}</div></div>
          <div><div className="text-xs text-muted">DOB</div><div>{u.dateOfBirth ? format(new Date(u.dateOfBirth), 'PPP') : '—'}</div></div>
          <div><div className="text-xs text-muted">License #</div><div>{u.licenseNumber ?? '—'}</div></div>
          <div><div className="text-xs text-muted">License expiry</div><div>{u.licenseExpiry ? format(new Date(u.licenseExpiry), 'PPP') : '—'}</div></div>
          {u.licenseImage && <img src={u.licenseImage} className="mt-2 w-full rounded border border-border" alt="" />}
        </div>
        <div className="card p-5 md:col-span-2">
          <h2 className="font-display text-lg mb-3">Bookings ({u.bookings.length})</h2>
          <div className="divide-y divide-border">
            {u.bookings.map((b: any) => (
              <div key={b.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <div className="font-medium">{b.car.year} {b.car.make} {b.car.model}</div>
                  <div className="text-xs text-muted">{format(new Date(b.startDate), 'MMM d')} → {format(new Date(b.endDate), 'MMM d, yyyy')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge-${b.status}`}>{b.status.replace('_', ' ')}</span>
                  <Link className="text-primary text-xs hover:underline" to={`/bookings/${b.id}`}>Open →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
