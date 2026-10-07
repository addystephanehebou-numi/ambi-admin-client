'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { BusinessInput } from '@/lib/types';
import { BusinessForm, EMPTY_BUSINESS } from '@/components/BusinessForm';

export default function NewBusinessPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: (body: BusinessInput) => api<{ id: string }>('/api/businesses', { method: 'POST', body }),
    onSuccess: async ({ id }) => {
      await queryClient.invalidateQueries({ queryKey: ['businesses'] });
      // Straight to the edit page so pricing can be added next.
      router.push(`/businesses/${id}?tab=catalog`);
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <Link href="/" className="text-sm text-secondary hover:text-ink">
          ← Businesses
        </Link>
        <h1 className="text-xl font-semibold">New business</h1>
        <p className="text-sm text-secondary">You&apos;ll add pricing on the next screen.</p>
      </div>
      <BusinessForm
        initial={EMPTY_BUSINESS}
        submitLabel="Create business"
        onSubmit={(value) => create.mutate(value)}
        saving={create.isPending}
        error={create.error?.message}
      />
    </div>
  );
}
