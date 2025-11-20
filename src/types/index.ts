export type PaymentMethod = 'cash' | 'upi' | 'other';
export type MilkQuality = 'cow' | 'buffalo' | 'mixed' | 'other';

export interface Customer {
  id: string;
  name: string;
  defaultQuantity: number; // in liters
  pricePerUnit: number; // price per liter
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  customerId: string;
  date: string; // ISO date string
  quantity: number; // in liters
  amount: number; // calculated: quantity * price
  notes?: string;
  milkQuality?: MilkQuality; // cow / buffalo / mixed / other
  delivered: boolean;
}

export interface MonthlySummary {
  month: string; // YYYY-MM format
  totalQuantity: number;
  totalRevenue: number;
  deliveryCount: number;
  customerBreakdown: CustomerMonthlyData[];
}

export interface Payment {
  id: string;
  customerId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
  date: string; // ISO date string
  createdAt: string;
}

export type SubscriptionPlan = 'demo' | 'monthly' | 'half_yearly' | 'yearly';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  entryLimit: number | null; // null = unlimited entries
  startDate: string; // ISO date string
  endDate?: string | null;
}

export interface CustomerMonthlyData {
  customerId: string;
  customerName: string;
  totalQuantity: number;
  totalAmount: number;
  deliveryCount: number;
}

export interface AppUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AppState {
  customers: Customer[];
  diaryEntries: DiaryEntry[];
}
