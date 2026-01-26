import { z } from "zod";

// Definimos el esquema sin objetos de configuración complejos que rompen TS
export const subscriptionFormSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  // Usamos z.number() directo. La conversión la haremos en el input
  price: z.number().min(0.01, "Price must be positive"),
  currency: z.enum(["EUR", "USD", "GBP"]),
  billingCycle: z.enum(["monthly", "yearly", "weekly"]),
  category: z.enum([
    "Entertainment",
    "Software",
    "Utilities",
    "Health",
    "Other",
  ]),
  startDate: z.date(), // Sin configs extra
  workspace: z.enum(["personal", "business"]).optional(),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;
