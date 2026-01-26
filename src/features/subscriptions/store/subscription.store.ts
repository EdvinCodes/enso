import { create } from "zustand";
import { db } from "@/lib/db";
import { Subscription } from "@/types";

// Definimos el tipo de datos que viene del formulario (sin IDs ni fechas de sistema)
type NewSubscriptionData = Omit<
  Subscription,
  "id" | "active" | "createdAt" | "updatedAt" | "nextPaymentDate"
>;

interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;

  // UI GLOBAL STATE
  currentView: "overview" | "calendar" | "settings";
  isModalOpen: boolean;
  subscriptionToEdit: Subscription | undefined;

  // ACTIONS
  setView: (view: "overview" | "calendar" | "settings") => void;
  openModal: (subscription?: Subscription) => void;
  closeModal: () => void;

  fetchSubscriptions: () => Promise<void>;

  // FIX: Ahora aceptamos NewSubscriptionData en lugar de Omit<Subscription, 'id'>
  addSubscription: (subscription: NewSubscriptionData) => Promise<void>;

  deleteSubscription: (id: string) => Promise<void>;
  updateSubscription: (
    id: string,
    data: Partial<Subscription>,
  ) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  isLoading: true,

  // UI Initial State
  currentView: "overview",
  isModalOpen: false,
  subscriptionToEdit: undefined,

  setView: (view) => set({ currentView: view }),

  openModal: (subscription) =>
    set({
      isModalOpen: true,
      subscriptionToEdit: subscription,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      subscriptionToEdit: undefined,
    }),

  fetchSubscriptions: async () => {
    set({ isLoading: true });
    try {
      // Pequeño delay artificial para que se vea el Skeleton (mejora UX)
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = await db.subscriptions.orderBy("nextPaymentDate").toArray();
      set({ subscriptions: data });
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // FIX: Lógica de creación enriquecida
  addSubscription: async (formData) => {
    const id = crypto.randomUUID();

    // Creamos el objeto completo para la DB
    const newSub: Subscription = {
      ...formData,
      id,
      active: true, // Por defecto activa
      createdAt: new Date(),
      updatedAt: new Date(),
      // Inicialmente, la próxima fecha de pago es la fecha de inicio
      // (Si es en el pasado, la lógica de visualización del calendario lo maneja,
      // o podríamos calcular la siguiente real aquí, pero esto basta para empezar)
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
      // NOTA: Si cambias la fecha de inicio al editar,
      // idealmente deberíamos recalcular nextPaymentDate aquí también.
    });
    await get().fetchSubscriptions();
  },
}));
