'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { BusinessSummary } from '@/lib/types';

export default function BusinessesPage() {
  const { data, isPending, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => api<BusinessSummary[]>('/api/businesses'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Businesses</h1>
        <Link href="/businesses/new" className="btn-primary">
          New business
        </Link>
      </div>

      {isPending && <p className="text-sm text-muted">Loading…</p>}
      {error && <p className="text-sm text-danger">{error.message}</p>}
      {data && !data.length && <p className="text-sm text-muted">No businesses yet.</p>}

      {data && data.length > 0 && (
        <ul className="divide-y divide-hairline rounded-xl border border-hairline">
          {data.map((b) => (
            <li key={b.id}>
              <Link href={`/businesses/${b.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface">
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-sm text-secondary">
                    {b.city}, {b.state}
                    {b.email ? ` · ${b.email}` : ' · no notification email'}
                  </div>
                </div>
                <span className="whitespace-nowrap text-sm text-secondary">
                  {b.request_count} request{b.request_count === 1 ? '' : 's'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
