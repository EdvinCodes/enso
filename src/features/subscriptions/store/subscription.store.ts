import { create } from "zustand";
import { db } from "@/lib/db";
import { Subscription, WorkspaceType } from "@/types";

interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;

  currentView: "overview" | "calendar" | "settings";

  currentWorkspace: WorkspaceType;

  isModalOpen: boolean;
  subscriptionToEdit: Subscription | undefined;

  setView: (view: "overview" | "calendar" | "settings") => void;
  setWorkspace: (workspace: WorkspaceType) => void;

  openModal: (subscription?: Subscription) => void;
  closeModal: () => void;
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (
    subscription: Omit<
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
  subscriptions: [],
  isLoading: true,
  currentView: "overview",

  currentWorkspace: "personal",

  isModalOpen: false,
  subscriptionToEdit: undefined,

  setView: (view) => set({ currentView: view }),
  setWorkspace: (workspace) => set({ currentWorkspace: workspace }),

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
  addSubscription: async (formData) => {
    const id = crypto.randomUUID();
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
      // NOTA: Si cambias la fecha de inicio al editar,
      // idealmente deberíamos recalcular nextPaymentDate aquí también.
    });
    await get().fetchSubscriptions();
  },
}));
