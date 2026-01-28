"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  Subscription,
  WorkspaceType,
  SubscriptionCategory,
  Currency,
  Payment, // <--- Importamos la interfaz Payment que ya definiste en types
} from "@/types";
import { toast } from "sonner";
import { refreshExchangeRates } from "@/lib/currency";
import { User } from "@supabase/supabase-js";

export type Budgets = Partial<Record<SubscriptionCategory, number>>;

// --- TIPOS DE BASE DE DATOS (snake_case) ---

interface DbSubscription {
  id: string;
  user_id: string;
  name: string;
  price: number;
  currency: string;
  billing_cycle: string;
  category: string;
  start_date: string;
  next_payment_date: string;
  active: boolean;
  workspace: string;
  created_at: string;
  updated_at: string;
}

// Nueva interfaz para respuesta de Pagos desde DB
interface DbPayment {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  payment_date: string;
  status: "paid" | "skipped" | "pending";
  notes?: string;
  created_at: string;
}

type NewSubscriptionData = Omit<
  Subscription,
  "id" | "active" | "createdAt" | "updatedAt" | "nextPaymentDate"
>;

// Datos necesarios para crear un nuevo pago
type NewPaymentData = Omit<Payment, "id" | "user_id" | "created_at">;

interface SubscriptionState {
  // --- STATE ---
  subscriptions: Subscription[];
  payments: Payment[];
  isLoading: boolean;
  currentView: "overview" | "calendar" | "settings";
  currentWorkspace: WorkspaceType;
  isModalOpen: boolean;
  subscriptionToEdit: Subscription | undefined;
  budgets: Budgets;
  user: User | null;

  // --- ACTIONS ---
  setView: (view: "overview" | "calendar" | "settings") => void;
  setWorkspace: (workspace: WorkspaceType) => void;
  updateBudget: (
    category: SubscriptionCategory,
    limit: number,
  ) => Promise<void>;
  openModal: (subscription?: Subscription) => void;
  closeModal: () => void;

  // --- ASYNC ACTIONS (CLOUD) ---
  checkAuth: () => Promise<void>;

  // Subscriptions
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (data: NewSubscriptionData) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>; // Ahora es Soft Delete
  updateSubscription: (
    id: string,
    data: Partial<Subscription>,
  ) => Promise<void>;

  // History / Payments
  fetchHistory: () => Promise<void>;
  logPayment: (data: NewPaymentData) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;

  signOut: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  payments: [], // <--- Inicializamos vacío
  isLoading: true,
  currentView: "overview",
  currentWorkspace: "personal",
  isModalOpen: false,
  subscriptionToEdit: undefined,
  budgets: {},
  user: null,

  setView: (view) => set({ currentView: view }),
  setWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  openModal: (sub) => set({ isModalOpen: true, subscriptionToEdit: sub }),
  closeModal: () => set({ isModalOpen: false, subscriptionToEdit: undefined }),

  // --- AUTH CHECK ---
  checkAuth: async () => {
    refreshExchangeRates();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    set({ user });
    if (user) {
      // Cargamos TODO: Suscripciones y Historial
      await Promise.all([get().fetchSubscriptions(), get().fetchHistory()]);
    } else {
      set({ isLoading: false, subscriptions: [], payments: [] });
    }
  },

  updateBudget: async (category, limit) => {
    // Simulación optimista
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => {
      const newBudgets = { ...state.budgets, [category]: limit };
      if (typeof window !== "undefined")
        localStorage.setItem("enso_budgets", JSON.stringify(newBudgets));
      return { budgets: newBudgets };
    });
  },

  // --- CLOUD ACTIONS (SUPABASE) ---

  // 1. FETCH SUBSCRIPTIONS
  fetchSubscriptions: async () => {
    set({ isLoading: true });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("active", true) // <--- IMPORTANTE: Solo traemos las activas para el dashboard principal
        .order("created_at", { ascending: false });

      if (error) throw error;

      const dbData = data as unknown as DbSubscription[];

      const mappedSubscriptions: Subscription[] = dbData.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        currency: item.currency as Currency,
        billingCycle: item.billing_cycle as Subscription["billingCycle"],
        category: item.category as SubscriptionCategory,
        startDate: new Date(item.start_date),
        nextPaymentDate: new Date(item.next_payment_date || item.start_date),
        active: item.active,
        workspace: (item.workspace as WorkspaceType) || "personal",
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      // Cargar presupuestos locales
      let loadedBudgets: Budgets = {};
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("enso_budgets");
        if (saved) loadedBudgets = JSON.parse(saved);
      }

      set({
        subscriptions: mappedSubscriptions,
        budgets: loadedBudgets,
        isLoading: false,
        user,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to sync data");
      set({ isLoading: false });
    }
  },

  // 2. FETCH HISTORY
  fetchHistory: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("payment_date", { ascending: false }); // Ordenamos por fecha de pago (más reciente arriba)

      if (error) throw error;

      const dbData = data as unknown as DbPayment[];

      // Mapeamos de snake_case a camelCase (si fuera necesario, aunque Payment interface usa snake_case para simplificar)
      // Como tu interfaz Payment en 'types' usa snake_case (user_id, payment_date),
      // podemos usar el objeto directo, solo asegurando los tipos.

      const mappedPayments: Payment[] = dbData.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        subscription_id: p.subscription_id,
        amount: Number(p.amount),
        currency: p.currency,
        payment_date: p.payment_date,
        status: p.status,
        notes: p.notes,
        created_at: p.created_at,
      }));

      set({ payments: mappedPayments });
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  },

  // 3. LOG PAYMENT
  logPayment: async (paymentData) => {
    const user = get().user;
    if (!user) return;

    const dbPayload = {
      user_id: user.id,
      subscription_id: paymentData.subscription_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      payment_date: paymentData.payment_date, // Debe ser string YYYY-MM-DD
      status: paymentData.status,
      notes: paymentData.notes,
    };

    const { data, error } = await supabase
      .from("payments")
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error(error);
      toast.error("Failed to log payment");
      return;
    }

    // Actualizamos estado local
    const newPayment = data as Payment;
    set((state) => ({
      payments: [newPayment, ...state.payments],
    }));

    toast.success("Payment recorded");
  },

  deletePayment: async (paymentId) => {
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (error) {
      toast.error("Failed to delete payment");
      console.error(error);
      return;
    }

    // Actualizamos el estado local quitando ese pago
    set((state) => ({
      payments: state.payments.filter((p) => p.id !== paymentId),
    }));

    toast.success("Payment removed from history");
  },

  addSubscription: async (formData) => {
    const user = get().user;
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    const dbPayload = {
      user_id: user.id,
      name: formData.name,
      price: formData.price,
      currency: formData.currency,
      billing_cycle: formData.billingCycle,
      category: formData.category,
      start_date: formData.startDate.toISOString(),
      next_payment_date: formData.startDate.toISOString(),
      workspace: formData.workspace || get().currentWorkspace,
      active: true,
    };

    const { error } = await supabase.from("subscriptions").insert(dbPayload);

    if (error) {
      console.error(error);
      throw error;
    }

    await get().fetchSubscriptions();
  },

  deleteSubscription: async (id) => {
    // SOFT DELETE: No borramos, marcamos como inactiva y ponemos fecha de archivo
    const { error } = await supabase
      .from("subscriptions")
      .update({
        active: false,
        archived_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    await get().fetchSubscriptions();
    toast.success("Subscription archived");
  },

  updateSubscription: async (id, data) => {
    const dbPayload: Record<string, unknown> = {};

    if (data.name) dbPayload.name = data.name;
    if (data.price) dbPayload.price = data.price;
    if (data.currency) dbPayload.currency = data.currency;
    if (data.billingCycle) dbPayload.billing_cycle = data.billingCycle;
    if (data.category) dbPayload.category = data.category;
    if (data.startDate) {
      dbPayload.start_date = data.startDate.toISOString();
      dbPayload.next_payment_date = data.startDate.toISOString();
    }
    if (data.workspace) dbPayload.workspace = data.workspace;
    dbPayload.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("subscriptions")
      .update(dbPayload)
      .eq("id", id);
    if (error) throw error;
    await get().fetchSubscriptions();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, subscriptions: [], payments: [], budgets: {} });
    if (typeof window !== "undefined") localStorage.removeItem("enso_budgets");
  },
}));
