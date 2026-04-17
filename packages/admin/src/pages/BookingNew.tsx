import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const today = (off = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + off);
  return d.toISOString().slice(0, 10);
};

export default function BookingNew() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    userId: '',
    carId: params.get('carId') ?? '',
    start: today(0),
    end: today(2),
    pickupLocationId: '',
    dropoffLocationId: '',
    youngDriver: false,
    airportPickup: false,
    override: false,
    status: 'confirmed',
    notes: '',
  });
  const [customerSearch, setCustomerSearch] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const customersQ = useQuery({
    queryKey: ['admin-customers', customerSearch],
    queryFn: () => api.admin.customers(customerSearch || undefined),
  });
  const carsQ = useQuery({ queryKey: ['admin-cars'], queryFn: () => api.admin.cars() });
  const locsQ = useQuery({ queryKey: ['admin-locations'], queryFn: () => api.admin.locations() });

  const selectedCar = useMemo(
    () => carsQ.data?.find((c: any) => c.id === form.carId),
    [form.carId, carsQ.data],
  );
  const selectedCustomer = useMemo(
    () => customersQ.data?.find((c: any) => c.id === form.userId),
    [form.userId, customersQ.data],
  );

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  const mut = useMutation({
    mutationFn: () => {
      const payload: any = {
        userId: form.userId,
        carId: form.carId,
        start: new Date(form.start + 'T10:00:00').toISOString(),
        end: new Date(form.end + 'T10:00:00').toISOString(),
        youngDriver: form.youngDriver,
        airportPickup: form.airportPickup,
        override: form.override,
        status: form.status,
        notes: form.notes || undefined,
        pickupLocationId: form.pickupLocationId || undefined,
        dropoffLocationId: form.dropoffLocationId || undefined,
      };
      return api.admin.createBooking(payload);
    },
    onSuccess: (b: any) => nav(`/bookings/${b.id}`),
    onError: (e: any) => setErr(e?.message || 'Could not create booking'),
  });

  const canSubmit = form.userId && form.carId && form.start && form.end;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display">Manual booking</h1>
        <button onClick={() => nav('/bookings')} className="btn text-xs px-3 py-1 bg-surface border border-border">Cancel</button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setErr(null); mut.mutate(); }}
        className="card p-6 space-y-5"
      >
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Customer</div>
          <input
            placeholder="Search customer by name / email / phone…"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-48 overflow-auto border border-border rounded">
            {customersQ.data?.slice(0, 20).map((c: any) => (
              <button
                type="button"
                key={c.id}
                onClick={() => set('userId', c.id)}
                className={`w-full text-left px-3 py-2 text-sm border-b border-border/50 hover:bg-surface ${form.userId === c.id ? 'bg-primary/10' : ''}`}
              >
                <div className="font-medium">{c.firstName} {c.lastName}</div>
                <div className="text-xs text-muted">{c.email}{c.phone ? ` · ${c.phone}` : ''}</div>
              </button>
            ))}
            {customersQ.data?.length === 0 && (
              <div className="px-3 py-4 text-xs text-muted">
                No customers match. <a href="/customers/new" className="text-primary underline">Create one →</a>
              </div>
            )}
          </div>
          {selectedCustomer && (
            <div className="mt-2 text-xs text-muted">Selected: {selectedCustomer.firstName} {selectedCustomer.lastName}</div>
          )}
        </div>

        <Field label="Car *">
          <select required value={form.carId} onChange={(e) => set('carId', e.target.value)}>
            <option value="">Select a car…</option>
            {carsQ.data?.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.year} {c.make} {c.model} — ${Number(c.dailyRate).toFixed(0)}/day
                {c.status !== 'active' ? ` (${c.status})` : ''}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Pickup date *">
            <input required type="date" value={form.start} onChange={(e) => set('start', e.target.value)} />
          </Field>
          <Field label="Return date *">
            <input required type="date" min={form.start} value={form.end} onChange={(e) => set('end', e.target.value)} />
          </Field>
        </div>

        {locsQ.data && locsQ.data.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pickup location">
              <select value={form.pickupLocationId} onChange={(e) => set('pickupLocationId', e.target.value)}>
                <option value="">— use car's default —</option>
                {locsQ.data.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
            <Field label="Return location">
              <select value={form.dropoffLocationId} onChange={(e) => set('dropoffLocationId', e.target.value)}>
                <option value="">— use car's default —</option>
                {locsQ.data.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
          </div>
        )}

        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.youngDriver} onChange={(e) => set('youngDriver', e.target.checked)} />
            <span>Under 25 (adds per-day fee)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.airportPickup} onChange={(e) => set('airportPickup', e.target.checked)} />
            <span>Airport pickup</span>
          </label>
        </div>

        <Field label="Initial status">
          <select value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </Field>

        <Field label="Notes (optional)">
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} />
        </Field>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.override} onChange={(e) => set('override', e.target.checked)} />
          <span>Override availability (book even if car is reserved those dates)</span>
        </label>

        {selectedCar && (
          <div className="p-3 rounded border border-border bg-surface/60 text-xs text-muted">
            <div>Daily rate: ${Number(selectedCar.dailyRate).toFixed(2)}</div>
            {selectedCar.weeklyRate && <div>Weekly: ${Number(selectedCar.weeklyRate).toFixed(2)}</div>}
            {selectedCar.monthlyRate && <div>Monthly: ${Number(selectedCar.monthlyRate).toFixed(2)}</div>}
          </div>
        )}

        {err && <div className="p-3 rounded border border-red-500/40 bg-red-500/5 text-sm text-red-400">{err}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="submit" disabled={!canSubmit || mut.isPending} className="btn bg-primary text-white px-4 py-2 rounded disabled:opacity-50">
            {mut.isPending ? 'Creating…' : 'Create booking'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1">{label}</span>
      {children}
    </label>
  );
}
