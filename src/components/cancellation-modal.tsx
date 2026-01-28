"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Subscription } from "@/types";
import { getCancellationInfo } from "@/lib/cancellation-data";
import { ExternalLink, Mail, ShieldAlert, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
}

export function CancellationModal({ isOpen, onClose, subscription }: Props) {
  const [copied, setCopied] = useState(false);

  if (!subscription) return null;

  const info = getCancellationInfo(subscription.name);

  // Plantilla de email legal para bajas
  const emailTemplate = `Subject: Cancellation Request - ${subscription.name}

To whom it may concern,

I am writing to formally request the immediate cancellation of my subscription for ${subscription.name}.

Please confirm the cancellation and the end date of the service. I would also appreciate a confirmation that no further charges will be applied to my payment method.

Account details:
Name: [MY NAME]
Email: [MY EMAIL]

Thank you.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailTemplate);
    setCopied(true);
    toast.success("Email template copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="w-5 h-5" /> Cancel Subscription
          </DialogTitle>
          <DialogDescription>
            We help you terminate <strong>{subscription.name}</strong>{" "}
            correctly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {info ? (
            // --- CASO 1: TENEMOS INFO EN LA DB ---
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                <span className="text-sm font-medium">Difficulty Level</span>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                    info.difficulty === "easy"
                      ? "bg-green-500/10 text-green-500"
                      : info.difficulty === "medium"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {info.difficulty}
                </span>
              </div>

              {info.steps && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Follow these steps:</p>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {info.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {info.url && (
                <Button className="w-full gap-2" asChild>
                  <a href={info.url} target="_blank" rel="noopener noreferrer">
                    Go to Cancellation Page <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          ) : (
            // --- CASO 2: NO TENEMOS INFO, DAMOS PLANTILLA ---
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-600 dark:text-amber-400">
                We don&apos;t have a direct link for this service yet. The
                safest way is to send a formal email.
              </div>

              <div className="relative">
                <pre className="p-4 bg-muted rounded-lg text-xs font-mono text-muted-foreground whitespace-pre-wrap border border-border">
                  {emailTemplate}
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() =>
                  (window.location.href = `mailto:support@${subscription.name.toLowerCase().replace(/\s/g, "")}.com?body=${encodeURIComponent(emailTemplate)}`)
                }
              >
                <Mail className="w-4 h-4" /> Open Mail Client
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
