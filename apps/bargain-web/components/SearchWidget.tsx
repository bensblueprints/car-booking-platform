'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Calendar, Car, Search } from 'lucide-react';

const today = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

type Props = {
  defaultStart?: string;
  defaultEnd?: string;
  defaultCategory?: string;
};

const toDateInput = (iso?: string, fallbackOffset = 1) => {
  if (!iso) return today(fallbackOffset);
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return today(fallbackOffset);
  }
};

export default function SearchWidget({ defaultStart, defaultEnd, defaultCategory }: Props = {}) {
  const router = useRouter();
  const [start, setStart] = useState(toDateInput(defaultStart, 1));
  const [end, setEnd] = useState(toDateInput(defaultEnd, 4));
  const [category, setCategory] = useState(defaultCategory ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      start: new Date(start + 'T10:00:00').toISOString(),
      end: new Date(end + 'T10:00:00').toISOString(),
    });
    if (category) params.set('category', category);
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className="card p-4 md:p-6 grid md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end shadow-[0_30px_80px_-30px_rgba(225,29,46,0.4)]"
    >
      <div>
        <label className="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5 flex items-center gap-1"><Calendar size={10} /> Pickup</label>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="bg-ink-900 border border-line rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:border-flame/60" />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5 flex items-center gap-1"><Calendar size={10} /> Return</label>
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} min={start} className="bg-ink-900 border border-line rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:border-flame/60" />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5 flex items-center gap-1"><Car size={10} /> Vehicle type</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-ink-900 border border-line rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:border-flame/60">
          <option value="">Any</option>
          <option value="small-car">Small car</option>
          <option value="mid-sized-car">Mid-sized car</option>
          <option value="full-sized-car">Full-sized car</option>
          <option value="mid-sized-suv">Mid-sized SUV</option>
          <option value="full-sized-suv">Full-sized SUV</option>
          <option value="minivan">Minivan</option>
        </select>
      </div>
      <button className="btn-primary h-[46px] whitespace-nowrap"><Search size={16} /> Search cars</button>
    </form>
  );
}
