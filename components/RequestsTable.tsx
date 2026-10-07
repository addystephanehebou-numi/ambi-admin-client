'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { InstallRequest } from '@/lib/types';

const dateTime = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Read-only list of a business's most recent 200 install requests. */
export function RequestsTable({ businessId }: { businessId: string }) {
  const { data, isPending, error } = useQuery({
    queryKey: ['requests', businessId],
    queryFn: () => api<InstallRequest[]>(`/api/businesses/${businessId}/requests`),
  });

  if (isPending) return <p className="text-sm text-muted">Loading requests…</p>;
  if (error) return <p className="text-sm text-danger">{error.message}</p>;
  if (!data.length) return <p className="text-sm text-muted">No install requests yet.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-hairline">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface text-xs text-secondary">
          <tr>
            <th className="px-3 py-2 font-medium">Received</th>
            <th className="px-3 py-2 font-medium">Customer</th>
            <th className="px-3 py-2 font-medium">Vehicle</th>
            <th className="px-3 py-2 font-medium">Preferred time</th>
            <th className="px-3 py-2 font-medium">Method</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 text-right font-medium">Quote</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} className="border-t border-hairline align-top">
              <td className="whitespace-nowrap px-3 py-2">{dateTime.format(new Date(r.created_at))}</td>
              <td className="px-3 py-2">
                <div>
                  {r.first_name} {r.last_name}
                </div>
                <div className="text-xs text-secondary">{r.email}</div>
                <div className="text-xs text-secondary">{r.phone}</div>
              </td>
              <td className="px-3 py-2">
                {r.year} {r.make} {r.model}
              </td>
              <td className="whitespace-nowrap px-3 py-2">{dateTime.format(new Date(r.preferred_date_start_time))}</td>
              <td className="px-3 py-2 capitalize">{r.selected_installation_method}</td>
              <td className="px-3 py-2">
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs">{r.status.replace('_', ' ')}</span>
              </td>
              <td className="px-3 py-2 text-right">{r.quote_total == null ? '—' : money.format(r.quote_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
