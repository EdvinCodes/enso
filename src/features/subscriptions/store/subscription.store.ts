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

interface DbBudget {
  id: string;
  userid: string;
  category: string;
  monthly_limit: number;
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
  baseCurrency: Currency;
  setBaseCurrency: (currency: Currency) => void;

  // --- ACTIONS ---
  setView: (view: "overview" | "calendar" | "settings") => void;
  setWorkspace: (workspace: WorkspaceType) => Promise<void>;
  fetchBudgets: () => Promise<void>;
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

  // --- NUEVAS ACCIONES DATA / BACKUP ---
  bulkAddSubscriptions: (subs: Partial<Subscription>[]) => Promise<void>;
  hardResetData: () => Promise<void>;

  archivedSubscriptions: Subscription[];
  fetchArchivedSubscriptions: () => Promise<void>;
  restoreSubscription: (id: string) => Promise<void>;
  deleteArchivedSubscription: (id: string) => Promise<void>;

  // History / Payments
  fetchHistory: () => Promise<void>;
  logPayment: (data: NewPaymentData) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;

  signOut: () => Promise<void>;

  isAuthChecked: boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  archivedSubscriptions: [],
  payments: [], // <--- Inicializamos vacío
  isLoading: true,
  currentView: "overview",
  currentWorkspace: "personal",
  isModalOpen: false,
  subscriptionToEdit: undefined,
  budgets: {},
  user: null,
  baseCurrency: "EUR", // <--- NUEVO
  isAuthChecked: false,

  setBaseCurrency: (currency) => {
    set({ baseCurrency: currency });
    if (typeof window !== "undefined") {
      localStorage.setItem("enso_base_currency", currency);
    }
  },

  setView: (view) => set({ currentView: view }),
  setWorkspace: async (workspace) => {
    set({ currentWorkspace: workspace });
    await get().fetchSubscriptions();
  },
  openModal: (sub) => set({ isModalOpen: true, subscriptionToEdit: sub }),
  closeModal: () => set({ isModalOpen: false, subscriptionToEdit: undefined }),

  // --- AUTH CHECK ---
  checkAuth: async () => {
    await refreshExchangeRates();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    set({ user });

    if (user) {
      await Promise.all([
        get().fetchSubscriptions(),
        get().fetchHistory(),
        get().fetchBudgets(), // ← NUEVO
      ]);
    } else {
      set({ isLoading: false, subscriptions: [], payments: [], budgets: {} });
    }

    set({ isAuthChecked: true });
  },

  fetchBudgets: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("userid", user.id);

    if (error) {
      console.error("Error fetching budgets", error);
      return;
    }

    const mapped: Budgets = {};
    (data as DbBudget[]).forEach((b) => {
      mapped[b.category as SubscriptionCategory] = b.monthly_limit;
    });

    set({ budgets: mapped });
  },

  updateBudget: async (category, limit) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("budgets").upsert(
      {
        userid: user.id,
        category,
        monthly_limit: limit,
        updatedat: new Date().toISOString(),
      },
      { onConflict: "userid,category" }, // Si ya existe ese par, actualiza
    );

    if (error) {
      console.error("Error saving budget", error);
      throw error;
    }

    // Actualizar estado local directamente (sin re-fetch, más rápido)
    set((state) => ({ budgets: { ...state.budgets, [category]: limit } }));
  },

  // --- CLOUD ACTIONS (SUPABASE) ---

  fetchSubscriptions: async () => {
    set({ isLoading: true });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    const currentWorkspace = get().currentWorkspace; // ← leemos el workspace actual

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("active", true)
        .eq("workspace", currentWorkspace) // ← filtro en DB, no en cliente
        .order("createdat", { ascending: false });

      if (error) throw error;

      const mappedSubscriptions: Subscription[] = (
        data as DbSubscription[]
      ).map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        currency: item.currency as Currency,
        billingCycle: item.billing_cycle as Subscription["billingCycle"],
        category: item.category as SubscriptionCategory,
        startDate: new Date(item.start_date),
        nextPaymentDate: new Date(item.next_payment_date ?? item.start_date),
        active: item.active,
        workspace: (item.workspace as WorkspaceType) ?? "personal",
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      // Cargar baseCurrency desde localStorage (esto sí puede seguir local)
      let loadedCurrency: Currency = "EUR";
      if (typeof window !== "undefined") {
        const savedCurrency = localStorage.getItem("ensobasecurrency");
        if (
          savedCurrency === "EUR" ||
          savedCurrency === "USD" ||
          savedCurrency === "GBP"
        ) {
          loadedCurrency = savedCurrency as Currency;
        }
      }

      set({
        subscriptions: mappedSubscriptions,
        baseCurrency: loadedCurrency,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching subscriptions", error);
      toast.error("Failed to sync data");
      set({ isLoading: false });
    }
  },

  fetchHistory: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("userid", user.id) // ← Filtro explícito (más seguro que depender solo de RLS)
        .order("paymentdate", { ascending: false })
        .limit(300); // ← Límite: cubre 25 años de pagos mensuales

      if (error) throw error;

      const mappedPayments: Payment[] = (data as DbPayment[]).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        subscription_id: p.subscription_id,
        amount: Number(p.amount),
        currency: p.currency,
        payment_date: p.payment_date,
        status: p.status,
        notes: p.notes,
        createdat: p.created_at,
      }));

      set({ payments: mappedPayments });
    } catch (error) {
      console.error("Error fetching history", error);
    }
  },

  logPayment: async (paymentData) => {
    const user = get().user;
    if (!user) return;

    const dbPayload = {
      user_id: user.id,
      subscription_id: paymentData.subscription_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      payment_date: paymentData.payment_date,
      status: paymentData.status,
      notes: paymentData.notes,
    };

    const { error } = await supabase
      .from("payments")
      .insert(dbPayload)
      .select()
      .single();

    if (error) {
      console.error(error);
      toast.error("Failed to log payment");
      return;
    }

    // re-sincronizamos el historial para garantizar consistencia total
    await get().fetchHistory();

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
    // 1. Primero borramos los pagos asociados a esta suscripción
    const { error: paymentsError } = await supabase
      .from("payments")
      .delete()
      .eq("subscriptionid", id);

    if (paymentsError) {
      console.error("Error deleting payments for subscription:", paymentsError);
      toast.error("Failed to archive subscription");
      return;
    }

    // 2. Luego archivamos (soft delete) la suscripción
    const { error } = await supabase
      .from("subscriptions")
      .update({ active: false, archivedat: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    // 3. Actualizamos el estado local limpiando también los pagos
    set((state) => ({
      payments: state.payments.filter((p) => p.subscription_id !== id),
    }));

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

  bulkAddSubscriptions: async (subs) => {
    const user = get().user;
    if (!user) throw new Error("Not authenticated");

    const dbPayload = subs.map((sub) => ({
      user_id: user.id,
      name: sub.name,
      price: sub.price,
      currency: sub.currency || "EUR",
      billing_cycle: sub.billingCycle || "monthly",
      category: sub.category || "Other",
      start_date: sub.startDate
        ? new Date(sub.startDate).toISOString()
        : new Date().toISOString(),
      next_payment_date: sub.nextPaymentDate
        ? new Date(sub.nextPaymentDate).toISOString()
        : new Date().toISOString(),
      workspace: sub.workspace || get().currentWorkspace,
      active: sub.active !== undefined ? sub.active : true,
    }));

    const { error } = await supabase.from("subscriptions").insert(dbPayload);
    if (error) {
      console.error(error);
      throw error;
    }

    await get().fetchSubscriptions();
  },

  hardResetData: async () => {
    const user = get().user;
    if (!user) throw new Error("Not authenticated");

    await supabase.from("payments").delete().eq("userid", user.id);
    await supabase.from("budgets").delete().eq("userid", user.id); // ← NUEVO
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("userid", user.id);
    if (error) throw error;

    set({ subscriptions: [], payments: [], budgets: {} });
    // Ya no hay nada que borrar de localStorage para budgets
  },

  // --- ARCHIVE ACTIONS ---
  fetchArchivedSubscriptions: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("active", false) // Solo las borradas
        .order("archived_at", { ascending: false });

      if (error) throw error;

      const mapped = (data as unknown as DbSubscription[]).map((item) => ({
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
      }));

      set({ archivedSubscriptions: mapped });
    } catch (error) {
      console.error("Error fetching archived:", error);
    }
  },

  restoreSubscription: async (id) => {
    const { error } = await supabase
      .from("subscriptions")
      .update({
        active: true,
        archived_at: null,
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to restore subscription");
      throw error;
    }

    toast.success("Subscription restored!");
    // Actualizamos ambas listas
    await Promise.all([
      get().fetchSubscriptions(),
      get().fetchArchivedSubscriptions(),
    ]);
  },

  deleteArchivedSubscription: async (id: string) => {
    // Cascade: pagos primero, luego la suscripción
    await supabase.from("payments").delete().eq("subscriptionid", id);

    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    set((state) => ({
      archivedSubscriptions: state.archivedSubscriptions.filter(
        (s) => s.id !== id,
      ),
      payments: state.payments.filter((p) => p.subscription_id !== id),
    }));

    toast.success("Subscription permanently deleted");
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, subscriptions: [], payments: [], budgets: {} });
    if (typeof window !== "undefined") localStorage.removeItem("enso_budgets");
  },
}));
