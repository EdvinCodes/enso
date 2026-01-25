"use client";

import { useEffect } from "react";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";
import { SubscriptionModal } from "@/features/subscriptions/components/SubscriptionModal";
import { SubscriptionCard } from "@/features/subscriptions/components/SubscriptionCard";
import { CategoryDistribution } from "@/features/subscriptions/components/CategoryDistribution";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { EnsoLogo } from "@/components/ui/enso-logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  LayoutGrid,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { convertToEur, formatCurrency } from "@/lib/currency";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/features/calendar/CalendarView";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CommandMenu } from "@/components/command-menu";

export default function DashboardPage() {
  const {
    subscriptions,
    fetchSubscriptions,
    deleteSubscription,
    isLoading,
    currentView, // Estado Global de la vista
    setView, // Acción para cambiar vista
    openModal, // Acción para abrir el modal global
  } = useSubscriptionStore();

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Cálculo del KPI normalizado a EUR
  const monthlyTotal = subscriptions.reduce((acc, sub) => {
    let priceInEur = convertToEur(sub.price, sub.currency);
    if (sub.billingCycle === "yearly") priceInEur = priceInEur / 12;
    if (sub.billingCycle === "weekly") priceInEur = priceInEur * 4;
    return acc + priceInEur;
  }, 0);

  return (
    <main className="relative min-h-screen font-sans bg-background text-foreground transition-colors duration-300 selection:bg-primary/30">
      <BackgroundGlow />

      {/* MODAL GLOBAL: Vive aquí y se controla por el Store */}
      <SubscriptionModal />

      <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-20 space-y-8">
        {/* Header */}
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
            <CommandMenu />
            <ThemeToggle />

            {/* Este botón abre el modal global en modo "Crear" */}
            <Button
              size="lg"
              className="shadow-lg shadow-primary/20"
              onClick={() => openModal()}
            >
              <Plus className="mr-2 h-5 w-5" /> Add New
            </Button>
          </div>
        </header>

        {/* Tabs Controladas por el Store */}
        <Tabs
          value={currentView}
          onValueChange={(v) => setView(v as "overview" | "calendar")}
          className="space-y-8"
        >
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

            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded border border-border/50">
              <span className="font-bold">⌘ K</span> <span>to search</span>
            </div>
          </div>

          {/* VISTA OVERVIEW */}
          <TabsContent
            value="overview"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Columna Izquierda: Analíticas */}
              <div className="space-y-6">
                <div className="grid gap-4">
                  <Card className="p-6 bg-card/40 border-border backdrop-blur-md relative overflow-hidden group shadow-sm">
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-24 bg-muted" />
                        <Skeleton className="h-10 w-48 bg-muted" />
                        <Skeleton className="h-6 w-32 bg-muted" />
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
                    <Skeleton className="h-[300px] w-full rounded-xl bg-muted" />
                  ) : (
                    <CategoryDistribution subscriptions={subscriptions} />
                  )}
                </div>
              </div>

              {/* Columna Derecha: Lista */}
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
                      <Skeleton
                        key={i}
                        className="h-28 w-full rounded-xl bg-muted"
                      />
                    ))
                  ) : subscriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-muted/20">
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <EnsoLogo className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                      <p className="text-muted-foreground font-medium">
                        No subscriptions yet
                      </p>
                      <p className="text-muted-foreground/60 text-sm mt-1">
                        Press{" "}
                        <span className="font-mono bg-muted px-1 rounded">
                          ⌘K
                        </span>{" "}
                        or click Add New
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

          {/* VISTA CALENDAR */}
          <TabsContent value="calendar" className="min-h-[600px]">
            {isLoading ? (
              <Skeleton className="w-full h-[600px] bg-muted rounded-xl" />
            ) : (
              <CalendarView subscriptions={subscriptions} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
