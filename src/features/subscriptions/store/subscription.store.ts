"use client";

import { create } from "zustand";
import { db } from "@/lib/db";
import { Subscription, WorkspaceType, SubscriptionCategory } from "@/types";

// Tipo para los presupuestos: { 'Entertainment': 50, 'Software': 100 }
export type Budgets = Partial<Record<SubscriptionCategory, number>>;

interface SubscriptionState {
  // --- STATE ---
  subscriptions: Subscription[];
  isLoading: boolean;
  currentView: "overview" | "calendar" | "settings";
  currentWorkspace: WorkspaceType;
  isModalOpen: boolean;
  subscriptionToEdit: Subscription | undefined;
  budgets: Budgets; // <--- NUEVO: Presupuestos

  // --- UI ACTIONS ---
  setView: (view: "overview" | "calendar" | "settings") => void;
  setWorkspace: (workspace: WorkspaceType) => void;
  setCategoryBudget: (category: SubscriptionCategory, limit: number) => void; // <--- NUEVO
  openModal: (subscription?: Subscription) => void;
  closeModal: () => void;

  // --- DB ACTIONS ---
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (
    data: Omit<
      Subscription,
      "id" | "active" | "createdAt" | "updatedAt" | "nextPaymentDate"
    >,
  ) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  updateSubscription: (
    id: string,
    data: Partial<Subscription>,
  ) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Estado Inicial
  subscriptions: [],
  isLoading: true,
  currentView: "overview",
  currentWorkspace: "personal",
  isModalOpen: false,
  subscriptionToEdit: undefined,
  budgets: {}, // Inicialmente vacío

  // Setters Simples
  setView: (view) => set({ currentView: view }),
  setWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  openModal: (subscription) =>
    set({ isModalOpen: true, subscriptionToEdit: subscription }),

  closeModal: () => set({ isModalOpen: false, subscriptionToEdit: undefined }),

  // --- BUDGET LOGIC (Local Storage) ---
  setCategoryBudget: (category, limit) => {
    set((state) => {
      const newBudgets = { ...state.budgets, [category]: limit };

      // Persistir en LocalStorage inmediatamente
      if (typeof window !== "undefined") {
        localStorage.setItem("enso_budgets", JSON.stringify(newBudgets));
      }

      return { budgets: newBudgets };
    });
  },

  // --- DB ACTIONS (Dexie + Init) ---
  fetchSubscriptions: async () => {
    set({ isLoading: true });
    try {
      // 1. Cargar Suscripciones de Dexie
      const data = await db.subscriptions.toArray();

      // 2. Cargar Presupuestos de LocalStorage
      let loadedBudgets: Budgets = {};
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("enso_budgets");
        if (saved) {
          try {
            loadedBudgets = JSON.parse(saved);
          } catch (e) {
            console.error("Failed to parse budgets", e);
          }
        }
      }

      set({ subscriptions: data, budgets: loadedBudgets, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      set({ isLoading: false });
    }
  },

  addSubscription: async (formData) => {
    const id = crypto.randomUUID();
    // Asignar al workspace actual si no viene definido
    const currentWorkspace = get().currentWorkspace;

    const newSub: Subscription = {
      ...formData,
      id,
      active: true,
      workspace: formData.workspace || currentWorkspace,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextPaymentDate: formData.startDate,
    };

    await db.subscriptions.add(newSub);
    await get().fetchSubscriptions();
  },

  deleteSubscription: async (id) => {
    await db.subscriptions.delete(id);
    await get().fetchSubscriptions();
  },

  updateSubscription: async (id, data) => {
    await db.subscriptions.update(id, {
      ...data,
      updatedAt: new Date(),
      // Si cambian la fecha de inicio, recalculamos el nextPayment (opcional, simplificado por ahora)
      ...(data.startDate ? { nextPaymentDate: data.startDate } : {}),
    });
    await get().fetchSubscriptions();
  },
}));
