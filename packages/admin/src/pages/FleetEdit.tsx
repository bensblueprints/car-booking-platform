import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';

// Popular makes cached up-front for instant dropdown. Full list is still fetched from NHTSA below.
const POPULAR_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia',
  'Jeep', 'Chrysler', 'Dodge', 'Ram', 'Subaru', 'Volkswagen', 'Mazda',
  'GMC', 'Buick', 'Cadillac', 'Lincoln', 'Acura', 'Lexus', 'Infiniti',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volvo', 'Mini', 'Mitsubishi', 'Tesla',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 40 }, (_, i) => CURRENT_YEAR + 1 - i);

export default function FleetEdit() {
  const { id } = useParams();
  const isNew = !id;
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: car } = useQuery({
    queryKey: ['car', id],
    queryFn: async () => (await api.admin.cars()).find((c: any) => c.id === id),
    enabled: !isNew,
  });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => api.categories() });
  const { data: locations } = useQuery({ queryKey: ['admin-locations'], queryFn: () => api.admin.locations() });

  const [form, setForm] = useState<any>({
    categoryId: '', make: '', model: '', year: CURRENT_YEAR,
    trim: '', seats: 5, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: '',
    features: [], images: [], color: '',
    dailyRate: '', weeklyRate: '', monthlyRate: '', depositAmount: 200, mileageLimit: '',
    locationId: '', status: 'active', description: '',
    vin: '', licensePlate: '',
  });

  useEffect(() => {
    if (car) {
      setForm({
        ...car,
        dailyRate: Number(car.dailyRate), weeklyRate: car.weeklyRate ? Number(car.weeklyRate) : '',
        monthlyRate: car.monthlyRate ? Number(car.monthlyRate) : '',
        depositAmount: Number(car.depositAmount),
        features: car.features ?? [], images: car.images ?? [],
        vin: car.vin ?? '', licensePlate: car.licensePlate ?? '',
      });
    }
  }, [car]);

  // NHTSA models for selected make + year (public API, no auth)
  const { data: modelsForMakeYear, isLoading: modelsLoading } = useQuery({
    queryKey: ['nhtsa-models', form.make, form.year],
    queryFn: async () => {
      if (!form.make) return [];
      const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(form.make)}/modelyear/${form.year}?format=json`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const j = await res.json();
      const names = (j.Results ?? []).map((r: any) => r.Model_Name).filter(Boolean) as string[];
      // de-dup + sort
      return Array.from(new Set(names)).sort();
    },
    enabled: !!form.make,
    staleTime: 1000 * 60 * 60, // 1h cache per (make,year)
  });

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
        vin: form.vin?.trim() || null,
        licensePlate: form.licensePlate?.trim() || null,
      };
      if (isNew) return api.admin.createCar(payload);
      return api.admin.updateCar(id!, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-cars'] });
      nav('/fleet');
    },
  });

  // Image helpers
  const addImage = (url: string) => {
    const u = url.trim();
    if (!u) return;
    setForm((f: any) => ({ ...f, images: [...f.images, u] }));
  };
  const removeImage = (idx: number) =>
    setForm((f: any) => ({ ...f, images: f.images.filter((_: string, i: number) => i !== idx) }));
  const moveImage = (idx: number, dir: -1 | 1) =>
    setForm((f: any) => {
      const next = [...f.images];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return f;
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...f, images: next };
    });

  const onFilePick = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > 800 * 1024) {
        alert(`${file.name} is too large (max 800KB). Upload elsewhere and paste URL instead.`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => addImage(String(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const [urlDraft, setUrlDraft] = useState('');

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

        <Field label="Year">
          <select className="w-full" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value), model: '' })}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <Field label="Make">
          <select className="w-full" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value, model: '' })}>
            <option value="">Select make…</option>
            {POPULAR_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label={`Model${modelsLoading ? ' (loading…)' : ''}`}>
          <select
            className="w-full"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            disabled={!form.make}
          >
            <option value="">{form.make ? 'Select model…' : 'Pick a make first'}</option>
            {(modelsForMakeYear ?? []).map((m: string) => <option key={m} value={m}>{m}</option>)}
            {form.model && !(modelsForMakeYear ?? []).includes(form.model) && (
              <option value={form.model}>{form.model} (custom)</option>
            )}
          </select>
          <div className="text-[11px] text-muted mt-1">
            Not in the list?{' '}
            <button
              type="button"
              className="underline"
              onClick={() => {
                const m = prompt('Enter model name');
                if (m) setForm({ ...form, model: m.trim() });
              }}
            >
              Type manually
            </button>
          </div>
        </Field>
        <Field label="Trim"><input className="w-full" value={form.trim ?? ''} onChange={(e) => setForm({ ...form, trim: e.target.value })} /></Field>
        <Field label="Color"><input className="w-full" value={form.color ?? ''} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>

        <Field label="VIN">
          <input
            className="w-full uppercase"
            maxLength={17}
            placeholder="17-char VIN"
            value={form.vin ?? ''}
            onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
          />
        </Field>
        <Field label="License plate">
          <input
            className="w-full uppercase"
            placeholder="ABC-1234"
            value={form.licensePlate ?? ''}
            onChange={(e) => setForm({ ...form, licensePlate: e.target.value.toUpperCase() })}
          />
        </Field>

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
          <label className="block mb-2">Images</label>
          <div className="space-y-2">
            {form.images.length === 0 && <div className="text-xs text-muted italic">No images yet — paste a URL or upload a file below.</div>}
            {form.images.map((url: string, i: number) => (
              <div key={i} className="flex items-center gap-2 border border-line rounded-md p-2">
                <img src={url} alt="" className="w-16 h-12 object-cover rounded" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.3')} />
                <input className="flex-1 text-xs" value={url} readOnly />
                <button type="button" className="btn-ghost text-xs" onClick={() => moveImage(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" className="btn-ghost text-xs" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1}>↓</button>
                <button type="button" className="text-xs text-red-400" onClick={() => removeImage(i)}>Remove</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              placeholder="Paste image URL…"
              className="flex-1"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addImage(urlDraft); setUrlDraft(''); }
              }}
            />
            <button type="button" className="btn-secondary" onClick={() => { addImage(urlDraft); setUrlDraft(''); }}>+ Add URL</button>
            <label className="btn-secondary cursor-pointer">
              Upload…
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onFilePick(e.target.files); e.target.value = ''; }} />
            </label>
          </div>
          <div className="text-[11px] text-muted mt-1">
            Upload saves as base64 (max 800 KB each). For larger/production images, paste a URL from your CDN.
          </div>
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
      <label className="block mb-1">{label}</label>
      {children}
    </div>
  );
}
