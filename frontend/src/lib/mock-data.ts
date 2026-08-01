// Mock data store for the ERP system

export interface Item {
  id: string;
  name: string;
  price: number;
  gst: number;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface SaleItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  party_name: string;
  items: SaleItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  doc_type: "Tax Invoice" | "Estimation";
  status: "Pending" | "Approved" | "Ready" | "Completed";
  created_at: string;
}

export interface CustomerOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  items: SaleItem[];
  total: number;
  status: "Pending" | "Approved" | "Ready" | "Completed";
  doc_type: string;
  created_at: string;
}

// Initial mock data
export const initialItems: Item[] = [
  { id: "1", name: "80mm 1mtr NP2 RCC Pipe", price: 85, gst: 18, stock: 150 },
  { id: "2", name: "80mm 2.5mtr NP2 RCC Pipe", price: 195, gst: 18, stock: 80 },
  { id: "3", name: "100mm 1mtr NP2 RCC Pipe", price: 105, gst: 18, stock: 200 },
  { id: "4", name: "100mm 2.5mtr NP2 RCC Pipe", price: 245, gst: 18, stock: 45 },
  { id: "5", name: "150mm 1mtr NP2 RCC Pipe", price: 165, gst: 18, stock: 120 },
  { id: "6", name: "150mm 2.5mtr NP2 RCC Pipe", price: 380, gst: 18, stock: 12 },
  { id: "7", name: "200mm 1mtr NP3 RCC Pipe", price: 250, gst: 18, stock: 90 },
  { id: "8", name: "200mm 2.5mtr NP3 RCC Pipe", price: 580, gst: 18, stock: 5 },
  { id: "9", name: "300mm 2.5mtr NP3 RCC Pipe", price: 950, gst: 18, stock: 35 },
  { id: "10", name: "400mm 2.5mtr NP3 RCC Pipe", price: 1450, gst: 18, stock: 0 },
  { id: "11", name: "500mm 2.5mtr NP3 RCC Pipe", price: 2200, gst: 18, stock: 22 },
  { id: "12", name: "600mm 2.5mtr NP4 RCC Pipe", price: 3500, gst: 18, stock: 8 },
];

export const initialCustomers: Customer[] = [
  { id: "1", name: "Rajesh Kumar", phone: "9876543210", address: "Vellore, Tamil Nadu" },
  { id: "2", name: "Suresh Builders", phone: "9845123456", address: "Chennai, Tamil Nadu" },
  { id: "3", name: "M.K. Constructions", phone: "9988776655", address: "Ranipet, Tamil Nadu" },
  { id: "4", name: "Tamil Nadu Water Board", phone: "9123456789", address: "Vellore District" },
  { id: "5", name: "Arun Infrastructure", phone: "8876543210", address: "Ambur, Tamil Nadu" },
  { id: "6", name: "Karthik Pipes Traders", phone: "9765432100", address: "Arcot, Tamil Nadu" },
];

export const initialSales: Sale[] = [
  {
    id: "INV-001",
    party_name: "Rajesh Kumar",
    items: [
      { name: "80mm 1mtr NP2 RCC Pipe", qty: 50, price: 85, total: 4250 },
      { name: "100mm 1mtr NP2 RCC Pipe", qty: 30, price: 105, total: 3150 },
    ],
    subtotal: 7400,
    cgst: 666,
    sgst: 666,
    total: 8732,
    doc_type: "Tax Invoice",
    status: "Completed",
    created_at: "2026-03-01",
  },
  {
    id: "INV-002",
    party_name: "Suresh Builders",
    items: [
      { name: "200mm 2.5mtr NP3 RCC Pipe", qty: 20, price: 580, total: 11600 },
    ],
    subtotal: 11600,
    cgst: 1044,
    sgst: 1044,
    total: 13688,
    doc_type: "Tax Invoice",
    status: "Completed",
    created_at: "2026-03-02",
  },
  {
    id: "INV-003",
    party_name: "M.K. Constructions",
    items: [
      { name: "300mm 2.5mtr NP3 RCC Pipe", qty: 15, price: 950, total: 14250 },
      { name: "150mm 2.5mtr NP2 RCC Pipe", qty: 25, price: 380, total: 9500 },
    ],
    subtotal: 23750,
    cgst: 2137.5,
    sgst: 2137.5,
    total: 28025,
    doc_type: "Tax Invoice",
    status: "Approved",
    created_at: "2026-03-05",
  },
  {
    id: "EST-001",
    party_name: "Tamil Nadu Water Board",
    items: [
      { name: "500mm 2.5mtr NP3 RCC Pipe", qty: 100, price: 2200, total: 220000 },
      { name: "600mm 2.5mtr NP4 RCC Pipe", qty: 50, price: 3500, total: 175000 },
    ],
    subtotal: 395000,
    cgst: 35550,
    sgst: 35550,
    total: 466100,
    doc_type: "Estimation",
    status: "Pending",
    created_at: "2026-03-07",
  },
  {
    id: "INV-004",
    party_name: "Arun Infrastructure",
    items: [
      { name: "150mm 1mtr NP2 RCC Pipe", qty: 40, price: 165, total: 6600 },
    ],
    subtotal: 6600,
    cgst: 594,
    sgst: 594,
    total: 7788,
    doc_type: "Tax Invoice",
    status: "Ready",
    created_at: "2026-03-06",
  },
];

export const initialCustomerOrders: CustomerOrder[] = [
  {
    id: "CO-001",
    customer_name: "Rajesh Kumar",
    customer_email: "rajesh@example.com",
    items: [{ name: "80mm 1mtr NP2 RCC Pipe", qty: 100, price: 85, total: 8500 }],
    total: 8500,
    status: "Pending",
    doc_type: "Order",
    created_at: "2026-03-08",
  },
  {
    id: "CO-002",
    customer_name: "Suresh Builders",
    customer_email: "suresh@example.com",
    items: [{ name: "200mm 1mtr NP3 RCC Pipe", qty: 50, price: 250, total: 12500 }],
    total: 12500,
    status: "Approved",
    doc_type: "Order",
    created_at: "2026-03-07",
  },
];

// Utility functions
export const formatMoney = (amount: number): string => {
  return "₹ " + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getStockStatus = (stock: number): { label: string; variant: "success" | "warning" | "destructive" } => {
  if (stock === 0) return { label: "Out of Stock", variant: "destructive" };
  if (stock < 20) return { label: "Low Stock", variant: "warning" };
  return { label: "In Stock", variant: "success" };
};
