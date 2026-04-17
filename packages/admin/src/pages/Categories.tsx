import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { api } from '../lib/api';

export default function Categories() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['categories'], queryFn: () => api.categories() });
  const [form, setForm] = useState({ slug: '', name: '', description: '', sortOrder: 0 });
  const create = useMutation({
    mutationFn: () => api.admin.createCategory(form),
    onSuccess: () => { setForm({ slug: '', name: '', description: '', sortOrder: 0 }); qc.invalidateQueries({ queryKey: ['categories'] }); },
  });
  const del = useMutation({
    mutationFn: (id: string) => api.admin.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-3xl font-display">Categories</h1>
      <div className="card p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div><label>Slug</label><input className="w-full" placeholder="compact" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div><label>Name</label><input className="w-full" placeholder="Compact" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label>Sort</label><input type="number" className="w-full" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
          <div className="flex items-end"><button className="btn-primary w-full" onClick={() => create.mutate()} disabled={create.isPending}><Plus size={16} /> Add</button></div>
          <div className="md:col-span-4"><label>Description</label><input className="w-full" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted uppercase tracking-wider">
            <tr className="border-b border-border"><th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Slug</th><th className="text-left py-3 px-4">Cars</th><th></th></tr>
          </thead>
          <tbody>
            {data?.map((c: any) => (
              <tr key={c.id} className="table-row">
                <td className="py-3 px-4 font-medium">{c.name}</td>
                <td className="py-3 px-4 text-muted">{c.slug}</td>
                <td className="py-3 px-4">{c._count?.cars ?? 0}</td>
                <td className="py-3 px-4 text-right">
                  <button className="btn-ghost text-red-400" onClick={() => confirm(`Delete "${c.name}"?`) && del.mutate(c.id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
