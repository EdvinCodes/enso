import Papa from "papaparse";

// Definimos qué buscamos en el texto del banco
const KEYWORD_MAP: Record<string, string> = {
  netflix: "Netflix",
  spotify: "Spotify",
  apple: "Apple Services",
  icloud: "iCloud",
  amazon: "Amazon Prime",
  aws: "AWS",
  hbo: "HBO Max",
  disney: "Disney+",
  adobe: "Adobe Creative Cloud",
  figma: "Figma",
  github: "GitHub",
  vercel: "Vercel",
  notion: "Notion",
  chatgpt: "ChatGPT",
  openai: "OpenAI",
  youtube: "YouTube Premium",
  google: "Google One",
  dropbox: "Dropbox",
  slack: "Slack",
  linear: "Linear",
};

export interface DetectedSubscription {
  id: string;
  name: string;
  price: number;
  currency: "EUR" | "USD" | "GBP";
  date: Date;
  originalDescription: string;
}

// Añadir esta función auxiliar antes de parseAndDetect:
function extractDateFromRow(rowString: string): Date {
  // Patrones comunes en extractos bancarios: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
  const patterns = [
    /(\d{4})-(\d{2})-(\d{2})/, // ISO: 2025-03-15
    /(\d{2})\/(\d{2})\/(\d{4})/, // ES/EU: 15/03/2025
    /(\d{2})-(\d{2})-(\d{4})/, // ES guiones: 15-03-2025
  ];

  for (const pattern of patterns) {
    const match = rowString.match(pattern);
    if (match) {
      const parsed = new Date(
        match[0]
          .replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1")
          .replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"),
      );
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }

  return new Date(); // Fallback a hoy si no encuentra fecha
}

export function parseAndDetect(file: File): Promise<DetectedSubscription[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const detected: DetectedSubscription[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = results.data as any[]; // PapaParse devuelve array de arrays o objetos

        rows.forEach((row, index) => {
          // Aseguramos que row es un array antes de hacer join
          if (!Array.isArray(row)) return;

          const rowString = row.join(" ").toLowerCase();

          let matchedService = null;
          for (const [keyword, serviceName] of Object.entries(KEYWORD_MAP)) {
            if (rowString.includes(keyword)) {
              matchedService = serviceName;
              break;
            }
          }

          if (matchedService) {
            const priceRegex = /-?\d+[.,]\d{2}/;
            const priceMatch = rowString.match(priceRegex);

            if (priceMatch) {
              let price = parseFloat(priceMatch[0].replace(",", "."));
              price = Math.abs(price);

              if (price > 0 && price < 1000) {
                let detectedCurrency: "EUR" | "USD" | "GBP" = "EUR";
                if (rowString.includes("$") || rowString.includes("usd"))
                  detectedCurrency = "USD";
                if (rowString.includes("£") || rowString.includes("gbp"))
                  detectedCurrency = "GBP";

                detected.push({
                  id: `csv-${index}`,
                  name: matchedService,
                  price,
                  currency: detectedCurrency,
                  date: extractDateFromRow(rowString), // ← fecha real del extracto
                  originalDescription: rowString.substring(0, 50) + "...",
                });
              }
            }
          }
        });

        resolve(detected);
      },
      error: (error) => reject(error),
      skipEmptyLines: true,
    });
  });
}
