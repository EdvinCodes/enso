"use client";

import { useState, useRef } from "react";
import {
  Download,
  Upload,
  Trash2,
  ShieldAlert,
  FileJson,
  CheckCircle2,
  FileSpreadsheet,
  User,
  Settings as SettingsIcon,
  Database,
  ArchiveRestore,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CsvImporter } from "./components/CsvImporter";
import { BudgetsManager } from "./BudgetsManager";
import { ArchiveManager } from "./components/ArchiveManager";
import { exportData, importData } from "@/lib/data";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";
import { toast } from "sonner";

export function SettingsView() {
  const { user, subscriptions, bulkAddSubscriptions, hardResetData } =
    useSubscriptionStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleExport = async () => {
    exportData(subscriptions); // Le pasamos los datos del store
    toast.success("Backup exported", {
      description: "Keep this JSON file safe!",
      icon: <Download className="w-4 h-4" />,
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.promise(
      async () => {
        const validItems = await importData(file);
        await bulkAddSubscriptions(validItems); // Subimos todo a Supabase
        setImportStatus("success");
        setTimeout(() => setImportStatus("idle"), 3000);
        return validItems.length;
      },
      {
        loading: "Restoring backup...",
        success: (count) => `Restored ${count} subscriptions successfully`,
        error: () => {
          setImportStatus("error");
          return "Invalid backup file.";
        },
      },
    );

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearData = async () => {
    toast("Factory Reset?", {
      description: "This creates a clean slate. Cloud data will be wiped.",
      action: {
        label: "Confirm Reset",
        onClick: async () => {
          await hardResetData(); // Borra Supabase y el Store local
          toast.success("All data cleared permanently");
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    // CORRECCIÓN DE DISEÑO: Quitamos max-w-4xl y mx-auto para que use el ancho del padre
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Sección */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">
            Manage your preferences and data.
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="w-4 h-4" /> General
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="w-4 h-4" /> Data
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <User className="w-4 h-4" /> Account
          </TabsTrigger>
        </TabsList>

        {/* --- TAB 1: GENERAL (Budgets) --- */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <BudgetsManager />
        </TabsContent>

        {/* --- TAB 2: DATA (Import/Export) --- */}
        <TabsContent value="data" className="mt-6 space-y-6">
          {/* NUEVO: Archive Manager */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ArchiveRestore className="w-5 h-5 text-muted-foreground" />
              Archived Items
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Recover previously deleted subscriptions.
            </p>
            <ArchiveManager />
          </div>

          {/* Bank Import Card */}
          <Card className="p-6 bg-card/40 border-border backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Smart Import</h3>
                  <p className="text-sm text-muted-foreground">
                    Import transactions from your bank CSV.
                  </p>
                </div>
              </div>
              <CsvImporter />
            </div>
          </Card>

          {/* Backup Management */}
          <Card className="p-6 bg-card/40 border-border backdrop-blur-md">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                <FileJson className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Backup & Restore</h3>
                <p className="text-sm text-muted-foreground">
                  Transfer your data between devices manually using JSON files.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                variant="outline"
                onClick={handleExport}
                className="flex-1 gap-2 border-dashed"
              >
                <Download className="w-4 h-4" /> Export Backup
              </Button>

              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".json"
                />
                <Button
                  variant="outline"
                  onClick={handleImportClick}
                  className="w-full gap-2 border-dashed"
                >
                  {importStatus === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Restore Backup
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* --- TAB 3: ACCOUNT --- */}
        <TabsContent value="account" className="mt-6 space-y-6">
          {/* Profile Card */}
          <Card className="p-6 bg-card/40 border-border backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{user?.email}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20"
                    >
                      PRO PLAN
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Active Account
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Manage
              </Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-red-500/20 bg-red-500/5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-500 shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-500">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-500/70">
                    Permanently delete all your tracked data. This cannot be
                    undone.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleClearData}
                className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Reset Data
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
