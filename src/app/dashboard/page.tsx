"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";
import { SubscriptionModal } from "@/features/subscriptions/components/SubscriptionModal";
import { SubscriptionCard } from "@/features/subscriptions/components/SubscriptionCard";
import { CategoryDistribution } from "@/features/subscriptions/components/CategoryDistribution";
import { SubscriptionStack } from "@/features/dashboard/components/SubscriptionStack";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { EnsoLogo } from "@/components/ui/enso-logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  LayoutList,
  LayoutGrid,
  Calendar as CalendarIcon,
  Plus,
  BellRing,
  Settings,
  Loader2,
  LogOut,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { convertToEur, formatCurrency, getRate } from "@/lib/currency";
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
import { CashflowChart } from "@/features/dashboard/components/CashflowChart";
import { Subscription, SubscriptionCategory, Currency } from "@/types"; // <--- Import Currency
import { toast } from "sonner";
import { LogPaymentModal } from "@/components/log-payment-modal";
import { isSameMonth, parseISO } from "date-fns"; // <--- Import necesarios para la fecha

export default function DashboardPage() {
  const router = useRouter();

  const {
    checkAuth,
    user,
    subscriptions,
    deleteSubscription,
    signOut,
    isLoading,
    currentView,
    setView,
    openModal,
    currentWorkspace,
    budgets,
    payments, // <--- Importante: Traemos los pagos del store
  } = useSubscriptionStore();

  const [isLogPaymentOpen, setIsLogPaymentOpen] = useState(false);
  const [subToLog, setSubToLog] = useState<Subscription | null>(null);

  const [viewMode, setViewMode] = useState<"grid" | "stack">("grid");

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

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
      toast.success("Notifications enabled", {
        description: "You will be alerted 3 days before payments.",
      });
    } else {
      setPermission("denied");
      toast.error("Permission denied", {
        description: "Please enable notifications in your browser settings.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    toast.promise(deleteSubscription(id), {
      loading: "Deleting subscription...",
      success: "Subscription removed",
      error: "Failed to delete subscription",
    });
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    toast.success("Logged out successfully");
  };

  const handleOpenLogPayment = (sub: Subscription) => {
    setSubToLog(sub);
    setIsLogPaymentOpen(true);
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const subWorkspace = sub.workspace || "personal";
    return subWorkspace === currentWorkspace;
  });

  // --- LÓGICA DE CÁLCULO REAL ---
  // Esta función reemplaza a los antiguos reduce().
  // Calcula el gasto real usando pagos si existen, o proyecciones si no.
  const calculateCurrentMonthSpend = () => {
    const now = new Date();
    let total = 0;
    const catTotals: Record<string, number> = {};

    filteredSubscriptions.forEach((sub) => {
      if (!sub.active) return;

      // 1. ¿Existe un pago real este mes?
      const realPayment = payments.find(
        (p) =>
          p.subscription_id === sub.id &&
          isSameMonth(parseISO(p.payment_date), now),
      );

      let amount = 0;

      if (realPayment) {
        // Usamos el dato REAL
        if (realPayment.status === "paid") {
          // FIX: Forzamos el tipo con "as Currency"
          amount = convertToEur(
            realPayment.amount,
            realPayment.currency as Currency,
          );
        }
        // Si es "skipped", amount se queda en 0.
      } else {
        // Usamos la PROYECCIÓN (teórico)
        let price = convertToEur(sub.price, sub.currency);
        if (sub.billingCycle === "yearly") price /= 12;
        if (sub.billingCycle === "weekly") price *= 4;
        amount = price;
      }

      total += amount;
      catTotals[sub.category] = (catTotals[sub.category] || 0) + amount;
    });

    return { total, catTotals };
  };

  // Ejecutamos la función
  const { total: monthlyTotal, catTotals: categoryMonthlyTotals } =
    calculateCurrentMonthSpend();

  const activeBudgets = (Object.keys(budgets) as SubscriptionCategory[]).filter(
    (cat) => (budgets[cat] || 0) > 0,
  );

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen font-sans bg-background text-foreground transition-colors duration-300 selection:bg-primary/30">
      <BackgroundGlow />
      <SubscriptionModal />

      <LogPaymentModal
        isOpen={isLogPaymentOpen}
        onClose={() => setIsLogPaymentOpen(false)}
        subscription={subToLog}
      />

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
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-card/40 border-border backdrop-blur-md relative overflow-hidden group shadow-sm md:col-span-1 h-full flex flex-col justify-center">
                {isLoading ? (
                  <Skeleton className="h-20 w-full bg-muted" />
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
                      <div className="flex flex-wrap gap-2 mt-4">
                        <div className="flex items-center gap-2 text-emerald-500 text-xs bg-emerald-500/10 w-fit px-2 py-1 rounded-full border border-emerald-500/20">
                          <TrendingUp className="w-3 h-3" />
                          <span>{currentWorkspace}</span>
                        </div>
                        <div
                          className="flex items-center gap-1 text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20"
                          title={`1 EUR = ${getRate("USD")} USD`}
                        >
                          <span className="font-mono font-bold">
                            1€=${getRate("USD")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>
              <div className="md:col-span-2 h-full min-h-[300px]">
                {isLoading ? (
                  <Skeleton className="w-full h-full rounded-xl bg-muted" />
                ) : (
                  <CashflowChart subscriptions={filteredSubscriptions} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="grid gap-4">
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full rounded-xl bg-muted" />
                  ) : (
                    <CategoryDistribution
                      subscriptions={filteredSubscriptions}
                      payments={payments} // <--- Pasamos pagos
                    />
                  )}
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
                {/* TÍTULO Y BOTONES */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      Active Services
                    </h3>
                    <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-md transition-all ${
                          viewMode === "grid"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Grid View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("stack")}
                        className={`p-1.5 rounded-md transition-all ${
                          viewMode === "stack"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Stack View"
                      >
                        <LayoutList className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-1 rounded-md">
                    {isLoading ? "..." : filteredSubscriptions.length} ITEMS
                  </span>
                </div>

                {/* --- ÁREA DE SCROLL PARA LA LISTA --- */}
                {/* Ajustamos la altura: min-h para que no sea enana, max-h para que no explote */}
                <ScrollArea className="h-[calc(100vh-220px)] min-h-[400px] w-full rounded-md pr-3">
                  <div className="grid gap-3 mt-1 pb-4">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-28 w-full rounded-xl bg-muted"
                        />
                      ))
                    ) : filteredSubscriptions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-muted/20">
                        <EnsoLogo className="w-8 h-8 text-muted-foreground opacity-50 mb-4" />
                        <p className="text-muted-foreground font-medium">
                          No {currentWorkspace} subscriptions yet
                        </p>
                      </div>
                    ) : viewMode === "grid" ? (
                      // VISTA GRID
                      filteredSubscriptions.map((sub) => (
                        <SubscriptionCard
                          key={sub.id}
                          subscription={sub}
                          onDelete={handleDelete}
                          onLogPayment={handleOpenLogPayment}
                        />
                      ))
                    ) : (
                      // VISTA STACK
                      Object.entries(
                        filteredSubscriptions.reduce(
                          (acc, sub) => {
                            const cat = sub.category || "Other";
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(sub);
                            return acc;
                          },
                          {} as Record<string, typeof filteredSubscriptions>,
                        ),
                      ).map(([category, subs]) => (
                        <SubscriptionStack
                          key={category}
                          category={category}
                          subscriptions={subs}
                          onDelete={handleDelete}
                          onLogPayment={handleOpenLogPayment}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="min-h-[600px]">
            {isLoading ? (
              <Skeleton className="w-full h-[600px] bg-muted rounded-xl" />
            ) : (
              <CalendarView
                subscriptions={filteredSubscriptions}
                payments={payments} // <--- Pasamos pagos
              />
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
