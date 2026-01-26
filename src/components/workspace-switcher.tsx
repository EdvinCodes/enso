"use client";

import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Briefcase, User, ChevronDown, Check } from "lucide-react";

export function WorkspaceSwitcher() {
  const { currentWorkspace, setWorkspace } = useSubscriptionStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 bg-background/50 backdrop-blur-md border-border"
        >
          {currentWorkspace === "personal" ? (
            <User className="h-4 w-4 text-emerald-500" />
          ) : (
            <Briefcase className="h-4 w-4 text-blue-500" />
          )}
          <span className="hidden sm:inline-block capitalize">
            {currentWorkspace}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setWorkspace("personal")}>
          <User className="mr-2 h-4 w-4" />
          <span>Personal</span>
          {currentWorkspace === "personal" && (
            <Check className="ml-auto h-4 w-4 text-emerald-500" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setWorkspace("business")}>
          <Briefcase className="mr-2 h-4 w-4" />
          <span>Business</span>
          {currentWorkspace === "business" && (
            <Check className="ml-auto h-4 w-4 text-blue-500" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
