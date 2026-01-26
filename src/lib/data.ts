import { db } from "./db";
import { Subscription } from "@/types";

/**
 * Exporta todas las suscripciones a un archivo JSON
 */
export async function exportData() {
  try {
    const data = await db.subscriptions.toArray();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `enso-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Export failed:", error);
    throw new Error("Failed to export data");
  }
}

/**
 * Importa datos desde un archivo JSON y los fusiona con la DB actual
 */
export async function importData(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json) as Subscription[];

        if (!Array.isArray(data)) {
          throw new Error("Invalid format: Expected an array of subscriptions");
        }

        // Validación básica: verificar si tienen id, name, price
        const validItems = data.filter(
          (item) => item.id && item.name && typeof item.price === "number",
        );

        if (validItems.length === 0) {
          throw new Error("No valid subscriptions found in file");
        }

        // Usamos bulkPut para actualizar existentes o crear nuevas (Upsert)
        await db.subscriptions.bulkPut(validItems);
        resolve(validItems.length);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Borra todo (Danger Zone)
 */
export async function clearAllData() {
  await db.subscriptions.clear();
}
