import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { api } from '../lib/api';

export default function Locations() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-locations'], queryFn: () => api.admin.locations() });
  const empty = { name: '', address: '', city: '', state: '', zip: '' };
  const [form, setForm] = useState<any>(empty);
  const create = useMutation({
    mutationFn: () => api.admin.createLocation(form),
    onSuccess: () => { setForm(empty); qc.invalidateQueries({ queryKey: ['admin-locations'] }); },
  });
  const del = useMutation({
    mutationFn: (id: string) => api.admin.deleteLocation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-locations'] }),
  });

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-3xl font-display">Locations</h1>
      <div className="card p-4">
        <div className="grid md:grid-cols-5 gap-3">
          <div><label>Name</label><input className="w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label>Address</label><input className="w-full" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><label>City</label><input className="w-full" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div><label>State</label><input className="w-full" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
          <div><label>Zip</label><input className="w-full" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} /></div>
          <div className="md:col-span-5 flex justify-end">
            <button className="btn-primary" onClick={() => create.mutate()}><Plus size={16} /> Add location</button>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted uppercase tracking-wider">
            <tr className="border-b border-border"><th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Address</th><th></th></tr>
          </thead>
          <tbody>
            {data?.map((l: any) => (
              <tr key={l.id} className="table-row">
                <td className="py-3 px-4 font-medium">{l.name}</td>
                <td className="py-3 px-4 text-muted">{l.address}, {l.city} {l.state} {l.zip}</td>
                <td className="py-3 px-4 text-right">
                  <button className="btn-ghost text-red-400" onClick={() => confirm(`Delete "${l.name}"?`) && del.mutate(l.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
