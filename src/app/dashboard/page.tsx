"use client";

import { useEffect, useState } from "react";
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
  BellRing,
  Settings,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { convertToEur, formatCurrency } from "@/lib/currency";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/features/calendar/CalendarView";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CommandMenu } from "@/components/command-menu";
import { useSmartNotifications } from "@/hooks/use-smart-notifications";
import {
  requestNotificationPermission,
  sendNotification,
} from "@/lib/notifications";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { SettingsView } from "@/features/settings/SettingsView";
import { BudgetProgress } from "@/features/subscriptions/components/BudgetProgress";
import { CashflowChart } from "@/features/dashboard/components/CashflowChart"; // <--- IMPORTAR
import { SubscriptionCategory } from "@/types";

export default function DashboardPage() {
  const {
    subscriptions,
    fetchSubscriptions,
    deleteSubscription,
    isLoading,
    currentView,
    setView,
    openModal,
    currentWorkspace,
    budgets,
  } = useSubscriptionStore();

  useSmartNotifications(subscriptions);

  const [permission, setPermission] = useState("default");

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "default") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermission(Notification.permission);
    }
  }, []);

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermission("granted");
      sendNotification(
        "Notifications Active 🔔",
        "We'll notify you 3 days before any payment.",
      );
    } else {
      setPermission("denied");
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const subWorkspace = sub.workspace || "personal";
    return subWorkspace === currentWorkspace;
  });

  const monthlyTotal = filteredSubscriptions.reduce((acc, sub) => {
    if (!sub.active) return acc;
    let priceInEur = convertToEur(sub.price, sub.currency);
    if (sub.billingCycle === "yearly") priceInEur = priceInEur / 12;
    if (sub.billingCycle === "weekly") priceInEur = priceInEur * 4;
    return acc + priceInEur;
  }, 0);

  const categoryMonthlyTotals = filteredSubscriptions.reduce(
    (acc, sub) => {
      if (!sub.active) return acc;
      let priceInEur = convertToEur(sub.price, sub.currency);
      if (sub.billingCycle === "yearly") priceInEur = priceInEur / 12;
      if (sub.billingCycle === "weekly") priceInEur = priceInEur * 4;

      acc[sub.category] = (acc[sub.category] || 0) + priceInEur;
      return acc;
    },
    {} as Record<string, number>,
  );

  const activeBudgets = (Object.keys(budgets) as SubscriptionCategory[]).filter(
    (cat) => (budgets[cat] || 0) > 0,
  );

  return (
    <main className="relative min-h-screen font-sans bg-background text-foreground transition-colors duration-300 selection:bg-primary/30">
      <BackgroundGlow />
      <SubscriptionModal />

      <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-20 space-y-8">
        {/* HEADER */}
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

          <div className="flex items-center gap-3 flex-wrap">
            {permission === "default" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={enableNotifications}
                className="text-muted-foreground hover:text-foreground"
                title="Enable payment alerts"
              >
                <BellRing className="w-4 h-4" />
              </Button>
            )}
            <WorkspaceSwitcher />
            <CommandMenu />
            <ThemeToggle />
            <Button
              size="lg"
              className="shadow-lg shadow-primary/20"
              onClick={() => openModal()}
            >
              <Plus className="mr-2 h-5 w-5" /> Add New
            </Button>
          </div>
        </header>

        {/* TABS */}
        <Tabs
          value={currentView}
          onValueChange={(v) =>
            setView(v as "overview" | "calendar" | "settings")
          }
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
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded border border-border/50">
              <span className="font-bold">⌘ K</span> <span>to search</span>
            </div>
          </div>

          <TabsContent
            value="overview"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {/* --- SECCIÓN SUPERIOR: KPI + PROYECCIÓN (NUEVO DISEÑO) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. KPI CARD (Ocupa 1 columna) */}
              <Card className="p-6 bg-card/40 border-border backdrop-blur-md relative overflow-hidden group shadow-sm md:col-span-1 h-full flex flex-col justify-center">
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
                        <span>Active in {currentWorkspace}</span>
                      </div>
                    </div>
                  </>
                )}
              </Card>

              {/* 2. CASHFLOW FORECAST CHART (Ocupa 2 columnas) */}
              <div className="md:col-span-2 h-full min-h-[300px]">
                {isLoading ? (
                  <Skeleton className="w-full h-full rounded-xl bg-muted" />
                ) : (
                  <CashflowChart subscriptions={filteredSubscriptions} />
                )}
              </div>
            </div>

            {/* --- SECCIÓN INFERIOR: DETALLES --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="grid gap-4">
                  {/* CATEGORY DISTRIBUTION */}
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full rounded-xl bg-muted" />
                  ) : (
                    <CategoryDistribution
                      subscriptions={filteredSubscriptions}
                    />
                  )}

                  {/* SMART BUDGETS (Visible solo si hay presupuestos) */}
                  {activeBudgets.length > 0 && (
                    <Card className="p-5 space-y-4 border-border/50 bg-card/30 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm text-foreground">
                          Budget Health
                        </h4>
                      </div>
                      <div className="space-y-4">
                        {activeBudgets.map((cat) => {
                          const limit = budgets[cat] || 0;
                          const current = categoryMonthlyTotals[cat] || 0;

                          return (
                            <BudgetProgress
                              key={cat}
                              current={current}
                              limit={limit}
                              label={cat}
                              currency="EUR"
                            />
                          );
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    Active Services ({currentWorkspace})
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-1 rounded-md">
                    {isLoading ? "..." : filteredSubscriptions.length} ITEMS
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
                  ) : filteredSubscriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-muted/20">
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <EnsoLogo className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                      <p className="text-muted-foreground font-medium">
                        No {currentWorkspace} subscriptions yet
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
                    filteredSubscriptions.map((sub) => (
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
              <Skeleton className="w-full h-[600px] bg-muted rounded-xl" />
            ) : (
              <CalendarView subscriptions={filteredSubscriptions} />
            )}
          </TabsContent>

          <TabsContent value="settings" className="min-h-[600px]">
            <SettingsView />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
