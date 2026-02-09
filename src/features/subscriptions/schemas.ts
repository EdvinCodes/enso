import * as z from "zod";

export const subscriptionFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  currency: z.enum(["EUR", "USD", "GBP"]),
  // AQUI ESTABA EL ERROR: Faltaba "one_time"
  billingCycle: z.enum(["monthly", "yearly", "weekly", "one_time"]),
  category: z.enum([
    "Entertainment",
    "Software",
    "Utilities",
    "Health",
    "Other",
  ]),
  startDate: z.date(),
  workspace: z.enum(["personal", "business"]).optional(),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;
