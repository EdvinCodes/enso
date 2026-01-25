import { create } from 'zustand';
import { db, generateId } from '@/lib/db';
import { Subscription } from '@/types';
import { addMonths, addYears, addWeeks } from 'date-fns';

interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;
  
  // Actions
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'active' | 'nextPaymentDate'>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  updateSubscription: (id: string, data: Partial<Subscription>) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  isLoading: true,

  fetchSubscriptions: async () => {
    set({ isLoading: true }); // Aseguramos que se activa
    try {
      // TRUCO PRO: Añadimos 800ms artificiales para que se vea el skeleton suave
      // y la app no parezca que da un "glitch".
      await new Promise((resolve) => setTimeout(resolve, 800));

      const data = await db.subscriptions.orderBy('nextPaymentDate').toArray();
      set({ subscriptions: data });
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addSubscription: async (formData) => {
    // Calculadora de fechas simple (Luego haremos una util avanzada)
    let nextDate = new Date(formData.startDate);
    const today = new Date();
    
    while (nextDate < today) {
      if (formData.billingCycle === 'monthly') nextDate = addMonths(nextDate, 1);
      else if (formData.billingCycle === 'yearly') nextDate = addYears(nextDate, 1);
      else if (formData.billingCycle === 'weekly') nextDate = addWeeks(nextDate, 1);
    }

    const newSub: Subscription = {
      ...formData,
      id: generateId(),
      active: true,
      nextPaymentDate: nextDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.subscriptions.add(newSub);
    
    // Recargamos para actualizar la UI al instante
    await get().fetchSubscriptions(); 
  },

  deleteSubscription: async (id) => {
    await db.subscriptions.delete(id);
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
    }));
  },
  
  updateSubscription: async (id, data) => {
    // Actualizamos en Dexie
    await db.subscriptions.update(id, {
      ...data,
      updatedAt: new Date(),
      // Recalcular nextPaymentDate si cambia la fecha de inicio o el ciclo
      // (Por brevedad asumimos que si editas fecha, se recalcula en el componente o aquí)
    });
    // Refrescamos la UI
    await get().fetchSubscriptions();
  },
}));