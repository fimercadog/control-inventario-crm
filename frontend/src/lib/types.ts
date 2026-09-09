export type Segment = {
  id: number;
  name: string;
  status: string;
  clients_count?: number;
};

export type Client = {
  id: number;
  name: string;
  company_name?: string | null;
  segment_id?: number | null;
  segment?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: string;
  notes?: string | null;
};

export type Contact = {
  id: number;
  name: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  status: string;
  client_id?: number | null;
  client?: string | null;
  created_at: string;
};

export type ClientNote = {
  id: number;
  client_id: number;
  client?: string | null;
  body: string;
  author?: string | null;
  created_at: string;
};

export type Deal = {
  id: number;
  client_id: number;
  client?: Client;
  title: string;
  amount: number;
  stage: string;
  expected_close_date?: string | null;
};

export type ActivityRow = {
  id: number;
  client_id?: number | null;
  client?: Client;
  deal_id?: number | null;
  type: string;
  subject: string;
  notes?: string | null;
  due_date?: string | null;
  completed: boolean;
};

export type Warehouse = {
  id: number;
  name: string;
  location?: string | null;
  status: string;
};

export type Category = {
  id: number;
  name: string;
  status: string;
  products_count?: number;
};

export type Brand = {
  id: number;
  name: string;
  status: string;
  products_count?: number;
};

export type Unit = {
  id: number;
  name: string;
  abbreviation?: string | null;
  status: string;
  products_count?: number;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  is_public?: boolean;
  category?: string | null;
  brand?: string | null;
  unit?: string | null;
  category_id?: number | null;
  brand_id?: number | null;
  unit_id?: number | null;
  unit_price: number;
  cost_price: number;
  reorder_level: number;
  stock_on_hand?: number;
  status: string;
};

export type Supplier = {
  id: number;
  name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: string;
};

export type StockTransfer = {
  id: number;
  product_id: number;
  product?: string | null;
  from_warehouse_id: number;
  from_warehouse?: string | null;
  to_warehouse_id: number;
  to_warehouse?: string | null;
  quantity: number;
  reference?: string | null;
  notes?: string | null;
  status: string;
  created_at: string;
};

export type StockMovement = {
  id: number;
  product_id: number;
  product?: Product;
  warehouse_id: number;
  warehouse?: Warehouse;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason?: string | null;
  reference?: string | null;
  created_at: string;
};

export type QuoteLineItem = {
  id: number;
  product_id?: number | null;
  product?: string | null;
  description?: string | null;
  quantity: number;
  unit_price: number;
};

export type Quote = {
  id: number;
  title: string;
  client_id: number;
  client?: string | null;
  deal_id?: number | null;
  deal?: string | null;
  status: "draft" | "sent" | "accepted" | "rejected";
  source?: "internal" | "catalog";
  valid_until?: string | null;
  notes?: string | null;
  total: number;
  converted_order_id?: number | null;
  items?: QuoteLineItem[];
  created_at: string;
};

export type OrderLineItem = {
  id: number;
  product_id: number;
  /** Snapshot: el nombre del producto al momento de la venta. */
  product?: string | null;
  sku?: string | null;
  quantity: number;
  unit_price: number;
};

export type Order = {
  id: number;
  client_id: number;
  client?: Client;
  deal_id?: number | null;
  warehouse_id: number;
  warehouse?: Warehouse;
  status: "draft" | "confirmed" | "cancelled";
  total: number;
  items?: OrderLineItem[];
};

export type PurchaseOrderLineItem = {
  id: number;
  product_id: number;
  product?: string | null;
  sku?: string | null;
  quantity: number;
  unit_cost: number;
};

export type PurchaseOrder = {
  id: number;
  supplier_id: number;
  supplier?: Supplier;
  warehouse_id: number;
  warehouse?: Warehouse;
  status: "draft" | "ordered" | "received" | "cancelled";
  order_date?: string | null;
  expected_date?: string | null;
  total: number;
  items?: PurchaseOrderLineItem[];
};

export type Role = {
  id: number;
  name: string;
  guard_name: string;
  status: string;
  permissions_count?: number;
  permissions?: string[];
};

export type AppUser = {
  id: number;
  name: string;
  email: string;
  status: string;
  role?: string;
  roles: string[];
};

/* ---- Vertical veterinaria ---- */

export type Species = {
  id: number;
  name: string;
  status: string;
  breeds_count?: number;
};

export type Breed = {
  id: number;
  name: string;
  status: string;
  species_id: number;
  species?: string | null;
};
