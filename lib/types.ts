export interface BusinessSummary {
  id: string;
  name: string;
  email: string | null;
  city: string;
  state: string;
  created_at: string;
  request_count: number;
}

export type SalesType = 'basic' | 'custom';

/** The editable basics; the shape PUT/POST /api/businesses expects. */
export interface BusinessInput {
  name: string;
  /** https image URL, or '' to show the name instead. */
  logo_url: string;
  email: string;
  sales_type: SalesType;
  description: string;
  contains_warranty: boolean;
  warranty_name: string;
  warranty_price: number | string | null;
  /** 'in_app': no color picker; the customer recolors the lights from a Bluetooth app. */
  color_selection: 'at_booking' | 'in_app';
  service_modes: 'shop' | 'mobile' | 'both';
  travel_fee_value: number | string;
  soonest_start_days_in_advance: number | string;
  address: {
    street_address: string;
    extended_address: string;
    city: string;
    state: string;
    postal_code: string;
  };
  owner: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
}

export type CatalogItem = { id: string } & Record<string, string | number>;

export interface BusinessDetail extends BusinessInput {
  id: string;
  created_at: string;
  catalog: Record<string, CatalogItem[]>;
}

export interface InstallRequest {
  id: string;
  status: string;
  created_at: string;
  selected_installation_method: string;
  preferred_date_start_time: string;
  preferred_date_end_time: string;
  /** Consecutive days the install takes, from the start date. */
  install_days: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  year: number;
  make: string;
  model: string;
  quote_total: number | null;
}
