import type { SalesType } from './types';

// How each catalog table is edited. Keys match CATALOG_KINDS in
// ambi-admin-server/catalog.ts; enum options match the Postgres enums.
export interface CatalogField {
  key: string;
  label: string;
  /** 'textarea' fields go on their own full-width line under the others. */
  kind: 'int' | 'money' | 'percent' | 'select' | 'text' | 'textarea' | 'checkbox' | 'time' | 'date';
  options?: readonly string[];
  /** Select fields: what each option reads as, when not its raw value. */
  optionLabels?: Record<string, string>;
  placeholder?: string;
  /** Money fields only: allow a negative amount (a discount). */
  allowNegative?: boolean;
  /** Number fields: the smallest allowed value, and the one a new row starts with. */
  min?: number;
  max?: number;
  /** Fields sharing a group go on their own labeled line under the main row. */
  group?: string;
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

const INCLUDED_ADD_ONS = 'Included add-ons';

// How much of the business's day a package takes. Only used once the
// business has schedule blocks (Schedule tab). The first option is what a
// new row starts with.
const DURATION_LABELS = { block: 'One block', full_day: 'Full day(s)' };
const durationField = (first: 'block' | 'full_day'): CatalogField => ({
  key: 'duration',
  label: 'Takes',
  kind: 'select',
  options: first === 'block' ? ['block', 'full_day'] : ['full_day', 'block'],
  optionLabels: DURATION_LABELS,
});

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
      durationField('block'),
      { key: 'description', label: 'Description', kind: 'textarea', placeholder: "What's included (optional)" },
    ],
  },
  {
    kind: 'headliner',
    salesTypes: ['basic'],
    title: 'Starlight headliner tiers',
    description:
      'Priced by fiber (star) count. Install days is how many days the install takes; customers see e.g. "2-day install" and the dates it covers. With schedule blocks, a full-day tier holds every block on that many open days.',
    fields: [
      { key: 'quantity', label: 'Stars', kind: 'int' },
      { key: 'price', label: 'Price', kind: 'money' },
      durationField('full_day'),
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
    kind: 'ambientPackage',
    salesTypes: ['basic'],
    title: 'Ambient lighting packages',
    description:
      'Customers pick one package or none; shown cheapest first. Included add-ons are free with the package and count toward each add-on\'s limit.',
    fields: [
      { key: 'name', label: 'Name', kind: 'text', placeholder: 'e.g. Full Interior Kit' },
      { key: 'price', label: 'Price', kind: 'money' },
      durationField('block'),
      { key: 'description', label: 'Description', kind: 'textarea', placeholder: "What's included (optional)" },
      { key: 'included_handles', label: 'Handles', kind: 'int', min: 0, max: 4, group: INCLUDED_ADD_ONS },
      { key: 'included_storage', label: 'Storage', kind: 'int', min: 0, max: 4, group: INCLUDED_ADD_ONS },
      { key: 'included_footwell', label: 'Footwell', kind: 'int', min: 0, max: 6, group: INCLUDED_ADD_ONS },
      { key: 'included_extra_dash_strip', label: 'Dash strips', kind: 'int', min: 0, max: 20, group: INCLUDED_ADD_ONS },
      { key: 'included_speaker_ring_lights', label: 'Speaker rings', kind: 'int', min: 0, max: 20, group: INCLUDED_ADD_ONS },
    ],
  },
  {
    kind: 'addOn',
    salesTypes: ['basic'],
    title: 'Door lighting add-ons',
    description:
      'Per-unit price. Customers can pick up to 4 handles, 4 storage, 6 footwells, and 20 dash strips or speaker rings.',
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

// The Schedule tab's tables. See ambi-client/db/016_schedule_blocks.sql.
export const SCHEDULE_UI: CatalogKindUi[] = [
  {
    kind: 'scheduleBlock',
    title: 'Blocks',
    description:
      'The fixed parts of the day a customer can book, in Pacific time. A one-block package takes one; a full-day package takes all of them. The start is the drop-off time. Each block can hold one request per day.',
    emptyLabel:
      'None yet. Without blocks, customers pick a preferred 2-hour window, nothing is held, and requests have no Confirm/Decline links.',
    fields: [
      { key: 'label', label: 'Name', kind: 'text', placeholder: 'e.g. Morning' },
      { key: 'start_time', label: 'Drop-off', kind: 'time' },
      { key: 'end_time', label: 'Done by', kind: 'time' },
    ],
  },
  {
    kind: 'closedDate',
    title: 'Closed dates',
    description: 'One-off days the business is closed, like holidays. Multi-day installs skip them.',
    emptyLabel: 'None.',
    fields: [{ key: 'day', label: 'Date', kind: 'date' }],
  },
];
