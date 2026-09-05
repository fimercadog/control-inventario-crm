export type Client = {
  id: number;
  name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: string;
  notes?: string | null;
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

export type Product = {
  id: number;
  sku: string;
  name: string;
  category?: string | null;
  unit: string;
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

export type OrderLineItem = {
  id: number;
  product_id: number;
  product?: Product;
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
  product?: Product;
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
