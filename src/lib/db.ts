import Dexie, { type EntityTable } from 'dexie';
import { type Subscription } from '@/types';

// Definimos la clase de la DB extendiendo Dexie
const DB_NAME = 'EnsoDatabase';

export class EnsoDatabase extends Dexie {
  // Tipado estricto para la tabla
  subscriptions!: EntityTable<Subscription, 'id'>;

  constructor() {
    super(DB_NAME);
    
    // Esquema: Solo indexamos los campos por los que vamos a buscar/ordenar
    this.version(1).stores({
      subscriptions: 'id, name, nextPaymentDate, active, category',
    });
  }
}

// Singleton: Instanciamos una sola vez para toda la app
export const db = new EnsoDatabase();

// Helper para generar IDs únicos (Standard Web API)
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};