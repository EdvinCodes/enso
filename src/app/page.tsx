"use client";

import { useEffect } from "react";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";
import { SubscriptionModal } from "@/features/subscriptions/components/SubscriptionModal";
import { SubscriptionCard } from "@/features/subscriptions/components/SubscriptionCard";
import { CategoryDistribution } from "@/features/subscriptions/components/CategoryDistribution";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { EnsoLogo } from "@/components/ui/enso-logo";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  LayoutGrid,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { convertToEur, formatCurrency } from "@/lib/currency";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/features/calendar/CalendarView";
import { ThemeToggle } from "@/components/ui/theme-toggle"; // <--- Importar Toggle

export default function DashboardPage() {
  const { subscriptions, fetchSubscriptions, deleteSubscription, isLoading } =
    useSubscriptionStore();

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const monthlyTotal = subscriptions.reduce((acc, sub) => {
    let priceInEur = convertToEur(sub.price, sub.currency);
    if (sub.billingCycle === "yearly") priceInEur = priceInEur / 12;
    if (sub.billingCycle === "weekly") priceInEur = priceInEur * 4;
    return acc + priceInEur;
  }, 0);

  return (
    // Quitamos 'bg-zinc-900' del main y usamos variables
    <main className="relative min-h-screen font-sans selection:bg-primary/30 bg-background text-foreground transition-colors duration-300">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-20 space-y-8">
        {/* Header Responsive */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-card/50 border border-border rounded-xl backdrop-blur-md shadow-sm">
              <EnsoLogo className="w-8 h-8 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                ENSO
              </h1>
              <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
                Finance OS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle /> {/* <--- Botón Light/Dark */}
            <SubscriptionModal />
          </div>
        </header>

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-4 gap-4">
            <TabsList className="bg-muted/50 border border-border">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                Calendar
              </TabsTrigger>
            </TabsList>

            <div className="hidden md:block text-xs font-mono text-muted-foreground">
              LOCAL STORAGE • ENCRYPTED
            </div>
          </div>

          <TabsContent
            value="overview"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="grid gap-4">
                  {/* KPI Card Refactorizado para usar colores semánticos */}
                  <Card className="p-6 bg-card/40 border-border backdrop-blur-md relative overflow-hidden group shadow-sm">
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                    ) : (
                      <>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Wallet className="w-32 h-32 rotate-[-15deg] text-foreground" />
                        </div>
                        <div className="relative z-10">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Monthly Run Rate (EUR)
                          </p>
                          <h2 className="text-4xl font-bold text-foreground tracking-tight">
                            {formatCurrency(monthlyTotal)}
                          </h2>
                          <div className="mt-4 flex items-center gap-2 text-emerald-500 text-sm bg-emerald-500/10 w-fit px-2 py-1 rounded-full border border-emerald-500/20">
                            <TrendingUp className="w-3 h-3" />
                            <span>Active Tracking</span>
                          </div>
                        </div>
                      </>
                    )}
                  </Card>

                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                  ) : (
                    <CategoryDistribution subscriptions={subscriptions} />
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    Active Services
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-1 rounded-md">
                    {isLoading ? "..." : subscriptions.length} ITEMS
                  </span>
                </div>

                <div className="grid gap-3">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-28 w-full rounded-xl" />
                    ))
                  ) : subscriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-muted/20">
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <EnsoLogo className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                      <p className="text-muted-foreground font-medium">
                        No subscriptions yet
                      </p>
                    </div>
                  ) : (
                    subscriptions.map((sub) => (
                      <SubscriptionCard
                        key={sub.id}
                        subscription={sub}
                        onDelete={deleteSubscription}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="min-h-[600px]">
            {isLoading ? (
              <Skeleton className="w-full h-[600px] rounded-xl" />
            ) : (
              <CalendarView subscriptions={subscriptions} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
