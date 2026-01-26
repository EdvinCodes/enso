"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// FIX: Asegúrate de que este componente existe y está exportado en su archivo
import { CsvImporter } from "./components/CsvImporter";
import {
  Download,
  Upload,
  Trash2,
  ShieldAlert,
  FileJson,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { exportData, importData, clearAllData } from "@/lib/data";
import { useSubscriptionStore } from "../subscriptions/store/subscription.store";
import { BudgetsManager } from "./BudgetsManager";

export function SettingsView() {
  const { fetchSubscriptions } = useSubscriptionStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleExport = async () => {
    await exportData();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const count = await importData(file);
      await fetchSubscriptions();
      setImportStatus("success");
      setTimeout(() => setImportStatus("idle"), 3000);
      alert(`Successfully imported ${count} subscriptions.`);
    } catch (error) {
      console.error(error);
      setImportStatus("error");
      alert("Failed to import data. Please check the file format.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearData = async () => {
    if (
      confirm(
        "ARE YOU SURE? This will permanently delete all your subscriptions.",
      )
    ) {
      await clearAllData();
      await fetchSubscriptions();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">
          Manage your data and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* 1. SMART BUDGETS */}
        <BudgetsManager />

        {/* 2. DATA PORTABILITY & IMPORT */}
        <Card className="p-6 bg-card/40 border-border backdrop-blur-md">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <FileJson className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                Data Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Import from banks or backup your data.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* NUEVA SECCIÓN: SMART IMPORT */}
            <div className="bg-muted/20 border border-border rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 hidden sm:block">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-foreground">
                    Bank Statement Import
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Auto-detect subscriptions from CSV.
                  </p>
                </div>
              </div>
              <CsvImporter />
            </div>

            <div className="h-px bg-border/50 w-full" />

            {/* SECCIÓN: BACKUP JSON (EXISTENTE) */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={handleExport}
                className="flex-1 gap-2 border-border/50"
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
                  className="w-full gap-2 border-border/50"
                >
                  {importStatus === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Import Backup
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. DANGER ZONE */}
        <Card className="p-6 border-red-500/20 bg-red-500/5 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-semibold text-red-500">
                Danger Zone
              </h3>
              <p className="text-sm text-red-500/70">
                Permanently remove all local data.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleClearData}
              className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Reset App
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
