'use client';

import { useState, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toMoneyInput } from '@/lib/money';
import type { CatalogField, CatalogKindUi } from '@/lib/catalog';
import type { CatalogItem } from '@/lib/types';

type Values = Record<string, string>;

/** How a stored value reads in its input; money always shows two decimals. */
const toInput = (field: CatalogField, value: unknown): string =>
  field.kind === 'money' ? toMoneyInput(value as number | string | null) : String(value ?? '');

/** A new row's starting value: the first option, unticked, or empty. */
const emptyValue = (field: CatalogField): string =>
  field.kind === 'checkbox' ? 'false' : field.min != null ? String(field.min) : (field.options?.[0] ?? '');

const toValues = (fields: CatalogField[], item?: CatalogItem): Values =>
  Object.fromEntries(fields.map((f) => [f.key, item ? toInput(f, item[f.key]) : emptyValue(f)]));

const isWide = (field: CatalogField) => field.kind === 'textarea';
/** Fields that sit in the main row and get a column header. */
const isInline = (field: CatalogField) => !isWide(field) && !field.group;

function FieldInput({ field, value, onChange }: { field: CatalogField; value: string; onChange: (v: string) => void }) {
  if (field.kind === 'select') {
    return (
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)} aria-label={field.label}>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {field.optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    );
  }
  // Sent as 'true'/'false', like every other value in the form.
  if (field.kind === 'checkbox') {
    return (
      <label className="flex h-10 items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-accent"
          checked={value === 'true'}
          aria-label={field.label}
          onChange={(e) => onChange(String(e.target.checked))}
        />
        {field.label}
      </label>
    );
  }
  if (field.kind === 'textarea') {
    return (
      <textarea
        className="input min-h-[64px] py-2"
        rows={2}
        value={value}
        placeholder={field.placeholder}
        aria-label={field.label}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.kind === 'time' || field.kind === 'date') {
    return (
      <input
        className="input"
        type={field.kind}
        required
        value={value}
        aria-label={field.label}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.kind === 'text') {
    return (
      <input
        className="input"
        required
        value={value}
        placeholder={field.placeholder}
        aria-label={field.label}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      className="input"
      type="number"
      min={field.min ?? (field.kind === 'int' ? (field.key === 'quantity' ? 1 : 0) : field.allowNegative ? undefined : 0)}
      max={field.max}
      step={field.kind === 'int' ? 1 : '0.01'}
      required
      value={value}
      aria-label={field.label}
      onChange={(e) => onChange(e.target.value)}
      // "12.5" becomes "12.50" once the admin leaves the field.
      onBlur={field.kind === 'money' ? () => onChange(toMoneyInput(value)) : undefined}
    />
  );
}

/** One item's inputs: short fields in a row next to the actions, wide ones (descriptions) below. */
function Fields({
  fields,
  values,
  onChange,
  actions,
}: {
  fields: CatalogField[];
  values: Values;
  onChange: (values: Values) => void;
  actions: ReactNode;
}) {
  const wide = fields.filter(isWide);
  const groups = [...new Set(fields.flatMap((field) => (field.group ? [field.group] : [])))];
  return (
    <div className={wide.length || groups.length ? 'space-y-2 rounded-lg border border-hairline p-3' : undefined}>
      <div className="flex items-center gap-2">
        {fields
          .filter(isInline)
          .map((field) => (
            <div key={field.key} className="flex-1">
              <FieldInput field={field} value={values[field.key] ?? ''} onChange={(v) => onChange({ ...values, [field.key]: v })} />
            </div>
          ))}
        {actions}
      </div>
      {wide.map((field) => (
        <FieldInput key={field.key} field={field} value={values[field.key] ?? ''} onChange={(v) => onChange({ ...values, [field.key]: v })} />
      ))}
      {groups.map((group) => (
        <div key={group} className="space-y-1">
          <p className="text-xs font-medium text-muted">{group}</p>
          <div className="flex gap-2">
            {fields
              .filter((field) => field.group === group)
              .map((field) => (
                <label key={field.key} className="flex-1 space-y-1 text-xs text-secondary">
                  <span>{field.label}</span>
                  <FieldInput field={field} value={values[field.key] ?? ''} onChange={(v) => onChange({ ...values, [field.key]: v })} />
                </label>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({ businessId, ui, item }: { businessId: string; ui: CatalogKindUi; item: CatalogItem }) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState(() => toValues(ui.fields, item));
  const dirty = ui.fields.some((f) => values[f.key] !== toInput(f, item[f.key]));
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['business', businessId] });

  const save = useMutation({
    mutationFn: () =>
      api(`/api/businesses/${businessId}/catalog/${ui.kind}/${item.id}`, { method: 'PATCH', body: values }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: () => api(`/api/businesses/${businessId}/catalog/${ui.kind}/${item.id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });
  const error = save.error ?? remove.error;

  return (
    <li className="space-y-1">
      <Fields
        fields={ui.fields}
        values={values}
        onChange={setValues}
        actions={
          <>
            <button className="btn-secondary w-[64px]" disabled={!dirty || save.isPending} onClick={() => save.mutate()}>
              Save
            </button>
            <button className="btn-danger w-[72px]" disabled={remove.isPending} onClick={() => remove.mutate()} aria-label="Delete">
              Delete
            </button>
          </>
        }
      />
      {error && <p className="text-sm text-danger">{error.message}</p>}
    </li>
  );
}

/** One catalog table for a business: edit rows in place, add new ones. */
export function CatalogSection({ businessId, ui, items }: { businessId: string; ui: CatalogKindUi; items: CatalogItem[] }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => toValues(ui.fields));

  const add = useMutation({
    mutationFn: () => api(`/api/businesses/${businessId}/catalog/${ui.kind}`, { method: 'POST', body: draft }),
    onSuccess: () => {
      setDraft(toValues(ui.fields));
      return queryClient.invalidateQueries({ queryKey: ['business', businessId] });
    },
  });

  return (
    <section className="card space-y-3">
      <div>
        <h3 className="font-semibold">{ui.title}</h3>
        <p className="text-sm text-secondary">{ui.description}</p>
      </div>

      <div className={`flex gap-2 pr-[152px] text-xs font-medium text-muted ${ui.fields.some((f) => !isInline(f)) ? 'px-3' : ''}`}>
        {ui.fields.filter(isInline).map((field) => (
          <span key={field.key} className="flex-1">
            {field.label}
          </span>
        ))}
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          // Keyed on values too so a refetch resets the row's local edits.
          <Row key={`${item.id}:${ui.fields.map((f) => item[f.key]).join(':')}`} businessId={businessId} ui={ui} item={item} />
        ))}
        {!items.length && (
          <li className="text-sm text-muted">{ui.emptyLabel ?? "None yet. Customers won't see this option."}</li>
        )}
      </ul>

      <form
        className="border-t border-hairline pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <Fields
          fields={ui.fields}
          values={draft}
          onChange={setDraft}
          actions={
            <button className="btn-primary w-[144px]" disabled={add.isPending}>
              {add.isPending ? 'Adding…' : 'Add'}
            </button>
          }
        />
      </form>
      {add.error && <p className="text-sm text-danger">{add.error.message}</p>}
    </section>
  );
}
