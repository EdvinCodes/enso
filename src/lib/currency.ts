import { Currency } from "@/types";

// Base: EUR
// Tasas aproximadas (1 EUR = X Moneda)
// En una versión V2 PRO, esto vendría de una API en tiempo real
export const EXCHANGE_RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.09, // 1 EUR = 1.09 USD
  GBP: 0.85, // 1 EUR = 0.85 GBP
};

/**
 * Convierte cualquier monto a EUR (nuestra moneda base por defecto)
 */
export function convertToEur(amount: number, fromCurrency: Currency): number {
  const rate = EXCHANGE_RATES[fromCurrency];
  // Si la tasa no existe (por seguridad), devolvemos el monto original
  if (!rate) return amount;
  
  // Fórmula: Monto / Tasa (porque la base es EUR)
  return amount / rate;
}

/**
 * Formateador universal para consistencia en toda la app
 */
export const formatCurrency = (amount: number, currency: Currency = 'EUR') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};