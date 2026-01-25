export type Currency = 'EUR' | 'USD' | 'GBP';
export type BillingCycle = 'monthly' | 'yearly' | 'weekly';
export type SubscriptionCategory = 'Entertainment' | 'Software' | 'Utilities' | 'Health' | 'Other';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  billingCycle: BillingCycle;
  startDate: Date;
  nextPaymentDate: Date;
  category: SubscriptionCategory;
  active: boolean;
  
  // Auditoría (Clave para proyectos serios)
  createdAt: Date;
  updatedAt: Date;
}