"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  Subscription,
  WorkspaceType,
  SubscriptionCategory,
  Currency,
} from "@/types"; // FIX: Importamos Currency
import { toast } from "sonner";
import { refreshExchangeRates } from "@/lib/currency";
import { User } from "@supabase/supabase-js";

export type Budgets = Partial<Record<SubscriptionCategory, number>>;

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

type NewSubscriptionData = Omit<
  Subscription,
  "id" | "active" | "createdAt" | "updatedAt" | "nextPaymentDate"
>;

interface SubscriptionState {
  // --- STATE ---
  subscriptions: Subscription[];
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
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (data: NewSubscriptionData) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  updateSubscription: (
    id: string,
    data: Partial<Subscription>,
  ) => Promise<void>;

  signOut: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
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
      get().fetchSubscriptions();
    } else {
      set({ isLoading: false, subscriptions: [] });
    }
  },

  updateBudget: async (category, limit) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => {
      const newBudgets = { ...state.budgets, [category]: limit };
      if (typeof window !== "undefined")
        localStorage.setItem("enso_budgets", JSON.stringify(newBudgets));
      return { budgets: newBudgets };
    });
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

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Tipado seguro de la respuesta de DB
      const dbData = data as unknown as DbSubscription[];

      // Mapeo estricto sin 'any'
      const mappedSubscriptions: Subscription[] = dbData.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        // FIX: Castings estrictos a los tipos Union
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
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", id);
    if (error) throw error;
    await get().fetchSubscriptions();
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
    set({ user: null, subscriptions: [], budgets: {} });
    // Opcional: limpiar localStorage si quieres ser muy estricto
    if (typeof window !== "undefined") localStorage.removeItem("enso_budgets");
  },
}));
