import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function FleetEdit() {
  const { id } = useParams();
  const isNew = !id;
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: car } = useQuery({
    queryKey: ['car', id],
    queryFn: async () => (await api.admin.cars()).find((c) => c.id === id),
    enabled: !isNew,
  });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => api.categories() });
  const { data: locations } = useQuery({ queryKey: ['admin-locations'], queryFn: () => api.admin.locations() });

  const [form, setForm] = useState<any>({
    categoryId: '', make: '', model: '', year: new Date().getFullYear(),
    trim: '', seats: 5, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: '',
    features: [], images: [], color: '',
    dailyRate: '', weeklyRate: '', monthlyRate: '', depositAmount: 200, mileageLimit: '',
    locationId: '', status: 'active', description: '',
  });

  useEffect(() => {
    if (car) {
      setForm({
        ...car,
        dailyRate: Number(car.dailyRate), weeklyRate: car.weeklyRate ? Number(car.weeklyRate) : '',
        monthlyRate: car.monthlyRate ? Number(car.monthlyRate) : '',
        depositAmount: Number(car.depositAmount),
        features: car.features ?? [], images: car.images ?? [],
      });
    }
  }, [car]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        ...form,
        year: Number(form.year),
        seats: Number(form.seats),
        doors: Number(form.doors),
        mpg: form.mpg ? Number(form.mpg) : null,
        dailyRate: Number(form.dailyRate),
        weeklyRate: form.weeklyRate ? Number(form.weeklyRate) : null,
        monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : null,
        depositAmount: Number(form.depositAmount),
        mileageLimit: form.mileageLimit ? Number(form.mileageLimit) : null,
        locationId: form.locationId || null,
        trim: form.trim || null,
        color: form.color || null,
        description: form.description || null,
      };
      if (isNew) return api.admin.createCar(payload);
      return api.admin.updateCar(id!, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-cars'] });
      nav('/fleet');
    },
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display">{isNew ? 'Add car' : `Edit ${form.year} ${form.make} ${form.model}`}</h1>
        <Link to="/fleet" className="btn-ghost">Back</Link>
      </div>

      <div className="card p-6 grid md:grid-cols-2 gap-4">
        <Field label="Category">
          <select className="w-full" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Select…</option>
            {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Location">
          <select className="w-full" value={form.locationId || ''} onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
            <option value="">—</option>
            {locations?.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </Field>

        <Field label="Make"><input className="w-full" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} /></Field>
        <Field label="Model"><input className="w-full" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></Field>
        <Field label="Year"><input type="number" className="w-full" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></Field>
        <Field label="Trim"><input className="w-full" value={form.trim ?? ''} onChange={(e) => setForm({ ...form, trim: e.target.value })} /></Field>
        <Field label="Color"><input className="w-full" value={form.color ?? ''} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
        <Field label="Seats"><input type="number" className="w-full" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} /></Field>
        <Field label="Doors"><input type="number" className="w-full" value={form.doors} onChange={(e) => setForm({ ...form, doors: e.target.value })} /></Field>
        <Field label="Transmission">
          <select className="w-full" value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </Field>
        <Field label="Fuel type">
          <select className="w-full" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
            <option value="gas">Gas</option><option value="hybrid">Hybrid</option><option value="ev">EV</option><option value="diesel">Diesel</option>
          </select>
        </Field>
        <Field label="MPG"><input type="number" className="w-full" value={form.mpg ?? ''} onChange={(e) => setForm({ ...form, mpg: e.target.value })} /></Field>
        <Field label="Mileage limit / day"><input type="number" className="w-full" value={form.mileageLimit ?? ''} onChange={(e) => setForm({ ...form, mileageLimit: e.target.value })} /></Field>

        <Field label="Daily rate ($)"><input type="number" className="w-full" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} /></Field>
        <Field label="Weekly rate ($)"><input type="number" className="w-full" value={form.weeklyRate ?? ''} onChange={(e) => setForm({ ...form, weeklyRate: e.target.value })} /></Field>
        <Field label="Monthly rate ($)"><input type="number" className="w-full" value={form.monthlyRate ?? ''} onChange={(e) => setForm({ ...form, monthlyRate: e.target.value })} /></Field>
        <Field label="Deposit ($)"><input type="number" className="w-full" value={form.depositAmount} onChange={(e) => setForm({ ...form, depositAmount: e.target.value })} /></Field>

        <Field label="Status">
          <select className="w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option><option value="maintenance">Maintenance</option><option value="retired">Retired</option>
          </select>
        </Field>

        <div className="md:col-span-2">
          <Field label="Features (comma-separated)">
            <input className="w-full" value={form.features.join(', ')} onChange={(e) => setForm({ ...form, features: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Image URLs (one per line)">
            <textarea rows={3} className="w-full" value={form.images.join('\n')} onChange={(e) => setForm({ ...form, images: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Description">
            <textarea rows={3} className="w-full" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link to="/fleet" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
      {save.isError && <div className="text-red-400 text-xs">{(save.error as any)?.message}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label>{label}</label>
      {children}
    </div>
  );
}
