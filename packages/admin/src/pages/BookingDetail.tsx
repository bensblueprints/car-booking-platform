import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { api } from '../lib/api';

export default function BookingDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data: b } = useQuery({ queryKey: ['booking', id], queryFn: () => api.admin.booking(id!) });
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (b) { setStatus(b.status); setNotes((b as any).notes ?? ''); }
  }, [b]);

  const save = useMutation({
    mutationFn: () => api.admin.updateBooking(id!, { status, notes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', id] }),
  });

  if (!b) return <div className="text-muted">Loading…</div>;
  const booking: any = b;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display">Booking <span className="text-muted text-base">#{booking.id.slice(0, 8)}</span></h1>
        <Link to="/bookings" className="btn-ghost">Back</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5 md:col-span-2 space-y-4">
          <div>
            <h2 className="font-display text-lg mb-2">Trip</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-muted">Pickup</div><div>{format(new Date(booking.startDate), 'PPP p')}</div></div>
              <div><div className="text-xs text-muted">Return</div><div>{format(new Date(booking.endDate), 'PPP p')}</div></div>
              <div><div className="text-xs text-muted">Pickup location</div><div>{booking.pickupLocation?.name ?? '—'}</div></div>
              <div><div className="text-xs text-muted">Return location</div><div>{booking.dropoffLocation?.name ?? '—'}</div></div>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <h2 className="font-display text-lg mb-2">Car</h2>
            <div className="flex gap-3">
              {booking.car.images?.[0] && <img src={booking.car.images[0]} className="w-32 h-20 object-cover rounded" alt="" />}
              <div>
                <div className="font-semibold">{booking.car.year} {booking.car.make} {booking.car.model} {booking.car.trim}</div>
                <div className="text-xs text-muted">{booking.car.category?.name} • {booking.car.transmission} • {booking.car.seats} seats</div>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <h2 className="font-display text-lg mb-2">Customer</h2>
            <div className="text-sm">
              <div className="font-semibold">{booking.user.firstName} {booking.user.lastName}</div>
              <div className="text-muted">{booking.user.email} · {booking.user.phone ?? 'no phone'}</div>
              {booking.user.licenseNumber && <div className="text-xs text-muted mt-1">License: {booking.user.licenseNumber}</div>}
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div>
            <h2 className="font-display text-lg mb-2">Pricing</h2>
            <dl className="text-sm space-y-1">
              <Row k="Subtotal" v={`$${Number(booking.subtotal).toFixed(2)}`} />
              <Row k="Fees" v={`$${Number(booking.fees).toFixed(2)}`} />
              <Row k="Tax" v={`$${Number(booking.taxes).toFixed(2)}`} />
              <Row k="Deposit" v={`$${Number(booking.depositHeld).toFixed(2)}`} />
              <div className="border-t border-border pt-2 mt-2">
                <Row k={<span className="font-semibold">Total</span>} v={<span className="font-semibold">${Number(booking.totalAmount).toFixed(2)}</span>} />
              </div>
            </dl>
          </div>
          <div>
            <label>Status</label>
            <select className="w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
              {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label>Internal notes</label>
            <textarea rows={4} className="w-full" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button className="btn-primary w-full" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: any) {
  return <div className="flex justify-between"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>;
}
