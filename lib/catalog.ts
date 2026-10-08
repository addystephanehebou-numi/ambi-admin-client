import type { SalesType } from './types';

// How each catalog table is edited. Keys match CATALOG_KINDS in
// ambi-admin-server/catalog.ts; enum options match the Postgres enums.
export interface CatalogField {
  key: string;
  label: string;
  /** 'textarea' fields go on their own full-width line under the others. */
  kind: 'int' | 'money' | 'percent' | 'select' | 'text' | 'textarea' | 'checkbox';
  options?: readonly string[];
  placeholder?: string;
  /** Money fields only: allow a negative amount (a discount). */
  allowNegative?: boolean;
  /** Number fields: the smallest allowed value, and the one a new row starts with. */
  min?: number;
  max?: number;
}

export interface CatalogKindUi {
  kind: string;
  title: string;
  description: string;
  fields: CatalogField[];
  /** Which sales types customers see this for; omitted means both. */
  salesTypes?: SalesType[];
  /** Shown when there are no rows. */
  emptyLabel?: string;
}

export const CATALOG_UI: CatalogKindUi[] = [
  {
    kind: 'customTier',
    title: 'Package tiers',
    description: 'Your own packages. Customers pick exactly one; shown cheapest first.',
    salesTypes: ['custom'],
    emptyLabel: "None yet. Customers can't get past the package step until you add one.",
    fields: [
      { key: 'name', label: 'Name', kind: 'text', placeholder: 'e.g. Plaid Kit' },
      { key: 'price', label: 'Price', kind: 'money' },
      { key: 'description', label: 'Description', kind: 'textarea', placeholder: "What's included (optional)" },
    ],
  },
  {
    kind: 'headliner',
    salesTypes: ['basic'],
    title: 'Starlight headliner tiers',
    description:
      'Priced by fiber (star) count. Install days is how many consecutive days the install takes; customers see e.g. "2-day install" and the dates it covers.',
    fields: [
      { key: 'quantity', label: 'Stars', kind: 'int' },
      { key: 'price', label: 'Price', kind: 'money' },
      { key: 'install_days', label: 'Install days', kind: 'int', min: 1, max: 14 },
    ],
  },
  {
    kind: 'starlightAddOn',
    salesTypes: ['basic'],
    title: 'Starlight add-ons',
    description:
      'On/off extras, shown once a customer picks a headliner. Enter noTwinkle as a negative price (e.g. -80.00). Tick "From" to show the price as "From $X".',
    fields: [
      {
        key: 'name',
        label: 'Add-on',
        kind: 'select',
        options: ['sunroof', 'dualColorStars', 'shootingStars', 'customDesigns', 'noTwinkle'],
      },
      { key: 'price', label: 'Price', kind: 'money', allowNegative: true },
      { key: 'is_starting_price', label: 'From', kind: 'checkbox' },
    ],
  },
  {
    kind: 'door',
    salesTypes: ['basic'],
    title: 'Door lighting tiers',
    description: 'Priced by number of doors.',
    fields: [
      { key: 'quantity', label: 'Doors', kind: 'int' },
      { key: 'price', label: 'Price', kind: 'money' },
    ],
  },
  {
    kind: 'addOn',
    salesTypes: ['basic'],
    title: 'Door lighting add-ons',
    description: 'Per-unit price. Customers pick a quantity from 0 to 8.',
    fields: [
      {
        key: 'name',
        label: 'Add-on',
        kind: 'select',
        options: ['handles', 'storage', 'footwell', 'extraDashStrip', 'speakerRingLights'],
      },
      { key: 'price', label: 'Unit price', kind: 'money' },
    ],
  },
  {
    kind: 'color',
    title: 'Colors offered',
    description: 'Which light colors customers can choose.',
    fields: [
      { key: 'name', label: 'Color', kind: 'select', options: ['red', 'blue', 'green', 'violet'] },
    ],
  },
  {
    kind: 'rush',
    title: 'Rush pricing',
    description: 'Surcharge when the requested date is within this many days.',
    fields: [
      { key: 'days_in_advance', label: 'Within (days)', kind: 'int' },
      { key: 'percentage', label: 'Surcharge %', kind: 'percent' },
    ],
  },
];
