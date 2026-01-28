export type Currency = "EUR" | "USD" | "GBP";
export type BillingCycle = "monthly" | "yearly" | "weekly";
export type SubscriptionCategory =
  | "Entertainment"
  | "Software"
  | "Utilities"
  | "Health"
  | "Other";

// AÑADIMOS EL TIPO WORKSPACE
export type WorkspaceType = "personal" | "business";

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  billingCycle: BillingCycle;
  category: SubscriptionCategory;
  startDate: Date;
  nextPaymentDate: Date;
  active: boolean;
  workspace?: WorkspaceType; // Opcional para soportar datos antiguos
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  payment_date: string;
  status: "paid" | "skipped" | "pending";
  notes?: string;
  created_at?: string;
}

export interface SubscriptionWithHistory extends Subscription {
  history?: Payment[];
}
