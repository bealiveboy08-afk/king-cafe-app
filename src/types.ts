export type Role = 'customer' | 'owner' | 'superadmin';

export type Category = 'Pizza' | 'Burger' | 'Beverages' | 'Sides' | 'Desserts';

export interface MenuItem {
  id: string;
  cafeId: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  rating: number;
  tags?: string[];
  preparationTimeMinutes: number;
  calories?: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizationNotes?: string;
}

export type OrderStatus =
  | 'order_sent'
  | 'approved_preparing'
  | 'delivered_served'
  | 'payment_confirmed'
  | 'cancelled';

export interface OrderStatusInfo {
  status: OrderStatus;
  customerHindiTitle: string;
  customerSubtitle: string;
  badgeColor: string;
  stepIndex: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  cafeId: string;
  cafeName: string;
  tableNumber: number;
  customerName: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  commissionAmount: number; // 10% commission for SaaS Super Admin
  saasCommission?: number; // 10% SaaS platform fee saved in Firestore
  status: OrderStatus;
  statusTimestamps: {
    sent: string;
    approved?: string;
    delivered?: string;
    paid?: string;
  };
  paymentMethod?: 'cash' | 'upi' | 'card' | 'counter';
  specialInstructions?: string;
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cafe {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  address: string;
  phone: string;
  tables: number[];
  currency: string;
  commissionRate: number; // e.g. 0.10 for 10%
  isDefault?: boolean;
  logo: string;
  bannerImage: string;
  openingHours: string;
}

export interface PlatformLedgerSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCommission: number;
  pendingOrdersCount: number;
  preparingOrdersCount: number;
  deliveredOrdersCount: number;
  paidOrdersCount: number;
}
