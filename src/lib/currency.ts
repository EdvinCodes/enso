import { Currency } from "@/types";

// 1. Tasas de Respaldo (Por si estamos Offline o la API falla)
const FALLBACK_RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.09,
  GBP: 0.85,
};

// Variable mutable en memoria que usaremos para los cálculos
let currentRates: Record<Currency, number> = { ...FALLBACK_RATES };

const CACHE_KEY = "enso_rates_v1";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Horas

interface RateCache {
  timestamp: number;
  rates: Record<string, number>;
}

/**
 * Intenta obtener tasas reales de la API (Frankfurter).
 * Si falla, usa caché. Si no hay caché, usa fallback.
 */
export async function refreshExchangeRates(): Promise<boolean> {
  // A. Intentar cargar del caché primero
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed: RateCache = JSON.parse(cached);
        const now = Date.now();

        // Si el caché es fresco (< 24h), lo usamos
        if (now - parsed.timestamp < CACHE_DURATION) {
          currentRates = { ...FALLBACK_RATES, ...parsed.rates };
          return true; // Éxito (desde caché)
        }
      } catch (e) {
        console.error("Error reading rates cache", e);
      }
    }
  }

  // B. Si no hay caché válido, llamamos a la API
  try {
    // Pedimos tasas con base EUR para USD y GBP
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=EUR&to=USD,GBP",
    );
    if (!res.ok) throw new Error("Failed to fetch rates");

    const data = await res.json();

    // Actualizamos la memoria
    currentRates = {
      EUR: 1,
      USD: data.rates.USD,
      GBP: data.rates.GBP,
    };

    // Guardamos en caché
    if (typeof window !== "undefined") {
      const cacheData: RateCache = {
        timestamp: Date.now(),
        rates: currentRates,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    }

    return true; // Éxito (desde API)
  } catch (error) {
    console.warn("⚠️ Could not fetch live rates. Using fallbacks.", error);
    // En caso de error, nos quedamos con lo que tengamos (Fallback o Caché viejo)
    return false;
  }
}

/**
 * Devuelve la tasa actual para mostrarla en la UI si quieres
 */
export function getRate(currency: Currency): number {
  return currentRates[currency] || FALLBACK_RATES[currency];
}

/**
 * Convierte cualquier monto de una moneda a la moneda destino del usuario
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = currentRates[fromCurrency] || FALLBACK_RATES[fromCurrency];
  const toRate = currentRates[toCurrency] || FALLBACK_RATES[toCurrency];

  // 1. Convertimos a la base neutral (EUR)
  const amountInEur = amount / fromRate;
  // 2. Convertimos a la moneda destino
  return amountInEur * toRate;
}

/**
 * Formateador universal inteligente (adapta el símbolo y el formato al país)
 */
export const formatCurrency = (amount: number, currency: Currency = "EUR") => {
  const locale =
    currency === "USD" ? "en-US" : currency === "GBP" ? "en-GB" : "es-ES";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
