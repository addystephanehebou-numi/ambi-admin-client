'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { toMoneyInput } from '@/lib/money';
import type { BusinessInput } from '@/lib/types';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
];

export const EMPTY_BUSINESS: BusinessInput = {
  name: '',
  logo_url: '',
  email: '',
  sales_type: 'basic',
  description: '',
  contains_warranty: false,
  warranty_name: '',
  warranty_price: '',
  color_selection: 'at_booking',
  service_modes: 'both',
  travel_fee_value: 0,
  soonest_start_days_in_advance: 3,
  address: { street_address: '', extended_address: '', city: '', state: 'CA', postal_code: '' },
  owner: { first_name: '', last_name: '', phone: '', email: '' },
};

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

/** A small preview of the logo URL as typed, so a broken link is obvious before saving. */
function LogoPreview({ url }: { url: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (!url.startsWith('https://')) return null;
  return (
    <div className="flex h-10 w-[120px] shrink-0 items-center justify-center rounded-md border border-hairline px-2">
      {failedUrl === url ? (
        <span className="text-xs text-danger">Can&apos;t load image</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Logo preview" className="max-h-7 max-w-full object-contain" onError={() => setFailedUrl(url)} />
      )}
    </div>
  );
}

/** The business basics: details, address, and owner. Used for create and edit. */
export function BusinessForm({
  initial,
  submitLabel,
  onSubmit,
  saving,
  error,
  saved,
}: {
  initial: BusinessInput;
  submitLabel: string;
  onSubmit: (value: BusinessInput) => void;
  saving: boolean;
  error?: string;
  saved?: boolean;
}) {
  // Money fields always show two decimals ("12.50", not "12.5").
  const [form, setForm] = useState<BusinessInput>(() => ({
    ...initial,
    travel_fee_value: toMoneyInput(initial.travel_fee_value),
    warranty_price: toMoneyInput(initial.warranty_price),
  }));

  const set = <K extends keyof BusinessInput>(key: K, value: BusinessInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const setAddress = (key: keyof BusinessInput['address'], value: string) =>
    setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
  const setOwner = (key: keyof BusinessInput['owner'], value: string) =>
    setForm((prev) => ({ ...prev, owner: { ...prev.owner, [key]: value } }));

  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="card space-y-4">
        <h2 className="font-semibold">Business</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Logo URL (optional; the name shows without one)" className="sm:col-span-2">
            <div className="flex items-center gap-3">
              <input
                className="input flex-1"
                type="url"
                pattern="https://.*"
                placeholder="https://…"
                value={form.logo_url}
                onChange={(e) => set('logo_url', e.target.value)}
              />
              <LogoPreview url={form.logo_url} />
            </div>
          </Field>
          <Field label="Notification email (new requests go here)">
            <input
              className="input"
              type="email"
              placeholder="Leave empty to not email the business"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </Field>
          <Field label="Install options">
            <select
              className="input"
              value={form.service_modes}
              onChange={(e) => set('service_modes', e.target.value as BusinessInput['service_modes'])}
            >
              <option value="both">Shop and mobile (customer chooses)</option>
              <option value="shop">Shop only (customer brings the car)</option>
              <option value="mobile">Mobile only (business travels)</option>
            </select>
          </Field>
          {/* Kept in the form state either way, so switching back doesn't lose it. */}
          {form.service_modes !== 'shop' && (
            <Field label="Mobile travel fee ($)">
              <input
                className="input"
                type="number"
                min={0}
                step="0.01"
                required
                value={form.travel_fee_value}
                onChange={(e) => set('travel_fee_value', e.target.value)}
                onBlur={() => set('travel_fee_value', toMoneyInput(form.travel_fee_value))}
              />
            </Field>
          )}
          <Field label="Soonest start (days in advance)">
            <input
              className="input"
              type="number"
              min={0}
              step={1}
              required
              value={form.soonest_start_days_in_advance}
              onChange={(e) => set('soonest_start_days_in_advance', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold">What they sell</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sales type">
            <select
              className="input"
              value={form.sales_type}
              onChange={(e) => set('sales_type', e.target.value as BusinessInput['sales_type'])}
            >
              <option value="basic">Basic: headliner, ambient packages and door add-ons</option>
              <option value="custom">Custom: their own package tiers</option>
            </select>
          </Field>
          <Field label="Light color">
            <select
              className="input"
              value={form.color_selection}
              onChange={(e) => set('color_selection', e.target.value as BusinessInput['color_selection'])}
            >
              <option value="at_booking">Customer picks a color when booking</option>
              <option value="in_app">Set after install in a Bluetooth app (no picker)</option>
            </select>
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea
              className="input min-h-[72px] py-2"
              rows={3}
              maxLength={1000}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-accent"
            checked={form.contains_warranty}
            onChange={(e) => set('contains_warranty', e.target.checked)}
          />
          Offer an optional warranty customers can add
        </label>
        {form.contains_warranty && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Warranty name">
              <input
                className="input"
                required
                placeholder="e.g. Extended 1-year warranty"
                value={form.warranty_name}
                onChange={(e) => set('warranty_name', e.target.value)}
              />
            </Field>
            <Field label="Warranty price ($)">
              <input
                className="input"
                type="number"
                min={0}
                step="0.01"
                required
                value={form.warranty_price ?? ''}
                onChange={(e) => set('warranty_price', e.target.value)}
                onBlur={() => set('warranty_price', toMoneyInput(form.warranty_price))}
              />
            </Field>
          </div>
        )}
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold">Address</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Street">
            <input
              className="input"
              required
              value={form.address.street_address}
              onChange={(e) => setAddress('street_address', e.target.value)}
            />
          </Field>
          <Field label="Suite / unit (optional)">
            <input
              className="input"
              value={form.address.extended_address}
              onChange={(e) => setAddress('extended_address', e.target.value)}
            />
          </Field>
          <Field label="City">
            <input className="input" required value={form.address.city} onChange={(e) => setAddress('city', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="State">
              <select className="input" value={form.address.state} onChange={(e) => setAddress('state', e.target.value)}>
                {US_STATES.map((state) => (
                  <option key={state}>{state}</option>
                ))}
              </select>
            </Field>
            <Field label="ZIP">
              <input
                className="input"
                required
                pattern="[0-9]{5}(-[0-9]{4})?"
                value={form.address.postal_code}
                onChange={(e) => setAddress('postal_code', e.target.value)}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold">Owner</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input className="input" required value={form.owner.first_name} onChange={(e) => setOwner('first_name', e.target.value)} />
          </Field>
          <Field label="Last name">
            <input className="input" required value={form.owner.last_name} onChange={(e) => setOwner('last_name', e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className="input" type="tel" required value={form.owner.phone} onChange={(e) => setOwner('phone', e.target.value)} />
          </Field>
          <Field label="Email">
            <input className="input" type="email" required value={form.owner.email} onChange={(e) => setOwner('email', e.target.value)} />
          </Field>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && !error && <p className="text-sm text-success-ink">Saved.</p>}
      </div>
    </form>
  );
}
