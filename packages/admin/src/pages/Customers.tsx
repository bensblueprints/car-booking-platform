import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { format } from 'date-fns';
import { api } from '../lib/api';

export default function Customers() {
  const [search, setSearch] = useState('');
  const { data } = useQuery({ queryKey: ['admin-customers', search], queryFn: () => api.admin.customers(search || undefined) });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display">Customers</h1>
        <div className="flex gap-2">
          <input placeholder="Search email, name, phone…" className="w-80" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Link to="/customers/new" className="btn bg-primary text-white px-3 py-1 rounded text-sm">+ New customer</Link>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted uppercase tracking-wider">
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Phone</th>
              <th className="text-left py-3 px-4">Bookings</th>
              <th className="text-left py-3 px-4">Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((u: any) => (
              <tr key={u.id} className="table-row">
                <td className="py-3 px-4 font-medium">{u.firstName} {u.lastName}</td>
                <td className="py-3 px-4 text-muted">{u.email}</td>
                <td className="py-3 px-4 text-muted">{u.phone ?? '—'}</td>
                <td className="py-3 px-4">{u._count?.bookings ?? 0}</td>
                <td className="py-3 px-4 text-xs text-muted">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                <td className="py-3 px-4 text-right"><Link to={`/customers/${u.id}`} className="text-primary text-xs hover:underline">Open →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
