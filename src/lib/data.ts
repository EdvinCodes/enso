import { Subscription } from "@/types";

/**
 * Exporta el array de suscripciones a un archivo JSON
 */
export function exportData(subscriptions: Subscription[]) {
  try {
    const jsonString = JSON.stringify(subscriptions, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `enso-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Limpieza de memoria
  } catch (error) {
    console.error("Export failed:", error);
    throw new Error("Failed to export data");
  }
}

/**
 * Lee un archivo JSON y devuelve un array de suscripciones válidas
 */
export async function importData(file: File): Promise<Partial<Subscription>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json) as Partial<Subscription>[];

        if (!Array.isArray(data)) {
          throw new Error("Invalid format: Expected an array of subscriptions");
        }

        // Validación básica
        const validItems = data.filter(
          (item) => item.name && typeof item.price === "number",
        );

        if (validItems.length === 0) {
          throw new Error("No valid subscriptions found in file");
        }

        resolve(validItems);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
