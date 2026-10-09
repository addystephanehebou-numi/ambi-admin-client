'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CATALOG_UI } from '@/lib/catalog';
import type { BusinessDetail, BusinessInput } from '@/lib/types';
import { BusinessForm } from '@/components/BusinessForm';
import { CatalogSection } from '@/components/CatalogSection';
import { RequestsTable } from '@/components/RequestsTable';

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'catalog', label: 'Pricing & options' },
  { id: 'requests', label: 'Install requests' },
] as const;

export default function BusinessPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const tab = TABS.find((t) => t.id === searchParams.get('tab'))?.id ?? 'details';
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: ['business', id],
    queryFn: () => api<BusinessDetail>(`/api/businesses/${id}`),
  });

  const save = useMutation({
    mutationFn: (body: BusinessInput) => api(`/api/businesses/${id}`, { method: 'PUT', body }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['business', id] }),
        queryClient.invalidateQueries({ queryKey: ['businesses'] }),
      ]),
  });

  const remove = useMutation({
    mutationFn: () => api(`/api/businesses/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['businesses'] });
      router.push('/');
    },
  });

  if (isPending) return <p className="text-sm text-muted">Loading…</p>;
  if (error) return <p className="text-sm text-danger">{error.message}</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-secondary hover:text-ink">
            ← Businesses
          </Link>
          <h1 className="text-xl font-semibold">{data.name}</h1>
        </div>
        <div className="text-right">
          <button
            className="btn-danger"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm(`Delete ${data.name} and all its pricing? This can't be undone.`)) remove.mutate();
            }}
          >
            Delete business
          </button>
          {remove.error && <p className="mt-1 max-w-xs text-sm text-danger">{remove.error.message}</p>}
        </div>
      </div>

      <nav className="flex gap-1 border-b border-hairline">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/businesses/${id}?tab=${t.id}`}
            replace
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              tab === t.id ? 'border-accent font-medium text-ink' : 'border-transparent text-secondary hover:text-ink'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === 'details' && (
        <BusinessForm
          // Remount after a save so the form shows what the server stored.
          key={JSON.stringify({ ...data, catalog: undefined })}
          initial={data}
          submitLabel="Save changes"
          onSubmit={(value) => save.mutate(value)}
          saving={save.isPending}
          error={save.error?.message}
          saved={save.isSuccess}
        />
      )}

      {tab === 'catalog' && (
        <div className="space-y-5">
          <p className="text-sm text-secondary">
            {data.sales_type === 'custom'
              ? 'This business sells its own package tiers.'
              : 'This business sells the basic headliner, ambient lighting package and door lighting add-on menu.'}{' '}
            <Link href={`/businesses/${id}?tab=details`} replace className="text-accent hover:underline">
              Change on Details
            </Link>
          </p>
          {CATALOG_UI.filter(
            (ui) =>
              (!ui.salesTypes || ui.salesTypes.includes(data.sales_type)) &&
              // Customers never see colors when they're set in an app.
              !(ui.kind === 'color' && data.color_selection === 'in_app'),
          ).map((ui) => (
            <CatalogSection key={ui.kind} businessId={id} ui={ui} items={data.catalog[ui.kind] ?? []} />
          ))}
        </div>
      )}

      {tab === 'requests' && <RequestsTable businessId={id} />}
    </div>
  );
}
