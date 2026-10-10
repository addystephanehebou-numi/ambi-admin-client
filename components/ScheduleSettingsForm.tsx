'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ScheduleSettings } from '@/lib/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Weekly closed days and the full-day drop-off time. */
export function ScheduleSettingsForm({ businessId, initial }: { businessId: string; initial: ScheduleSettings }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ScheduleSettings>(initial);

  const save = useMutation({
    mutationFn: () => api(`/api/businesses/${businessId}/schedule`, { method: 'PUT', body: form }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['business', businessId] }),
  });

  const toggleDay = (day: number, closed: boolean) =>
    setForm((prev) => ({
      ...prev,
      closed_weekdays: closed
        ? [...prev.closed_weekdays, day].sort()
        : prev.closed_weekdays.filter((d) => d !== day),
    }));

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div>
        <h3 className="font-semibold">Hours</h3>
        <p className="text-sm text-secondary">
          Customers can&apos;t start an install on a closed day, and multi-day installs skip them.
        </p>
      </div>

      <div>
        <span className="label">Closed every</span>
        <div className="flex flex-wrap gap-3">
          {WEEKDAYS.map((name, day) => (
            <label key={name} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-accent"
                checked={form.closed_weekdays.includes(day)}
                onChange={(e) => toggleDay(day, e.target.checked)}
              />
              {name}
            </label>
          ))}
        </div>
      </div>

      <label className="block max-w-xs">
        <span className="label">Full-day drop-off (optional; defaults to the first block&apos;s start)</span>
        <input
          className="input"
          type="time"
          value={form.full_day_drop_off_time}
          onChange={(e) => setForm((prev) => ({ ...prev, full_day_drop_off_time: e.target.value }))}
        />
      </label>

      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save hours'}
        </button>
        {save.error && <p className="text-sm text-danger">{save.error.message}</p>}
        {save.isSuccess && !save.error && <p className="text-sm text-success-ink">Saved.</p>}
      </div>
    </form>
  );
}
