export interface CancellationInfo {
  url?: string; // Link directo a la baja
  method: "online" | "email" | "phone" | "store";
  difficulty: "easy" | "medium" | "hard";
  steps?: string[]; // Pasos si es complicado
}

export const CANCELLATION_DB: Record<string, CancellationInfo> = {
  // --- ENTERTAINMENT ---
  Netflix: {
    method: "online",
    difficulty: "easy",
    url: "https://www.netflix.com/cancelplan",
  },
  Spotify: {
    method: "online",
    difficulty: "medium",
    url: "https://www.spotify.com/account/change-plan/",
    steps: [
      "Log in",
      "Scroll to 'Available plans'",
      "Scroll to bottom",
      "Click 'Cancel Premium'",
    ],
  },
  "Amazon Prime": {
    method: "online",
    difficulty: "medium",
    url: "https://www.amazon.com/gp/primecentral",
    steps: [
      "Click 'Update, Cancel and more'",
      "End Membership",
      "Ignore the offers to stay",
    ],
  },
  "Disney+": {
    method: "online",
    difficulty: "easy",
    url: "https://www.disneyplus.com/account",
    steps: ["Select your Subscription", "Click 'Cancel Subscription'"],
  },
  "HBO Max": {
    method: "online",
    difficulty: "easy",
    url: "https://play.hbomax.com/page/urn:hbo:page:user:billing",
    steps: ["Go to Settings", "Subscription", "Manage Subscription"],
  },
  "YouTube Premium": {
    method: "online",
    difficulty: "easy",
    url: "https://www.youtube.com/paid_memberships",
    steps: ["Click 'Manage Membership'", "Deactivate"],
  },
  Audible: {
    method: "online",
    difficulty: "medium",
    url: "https://www.audible.com/account/overview",
    steps: [
      "Go to Account Details",
      "Click 'Cancel membership'",
      "Confirm reason",
    ],
  },
  Twitch: {
    method: "online",
    difficulty: "easy",
    url: "https://www.twitch.tv/subscriptions",
    steps: ["Click the Cog icon on the sub", "Don't Renew Subscription"],
  },

  // --- PRODUCTIVITY & WORK ---
  "Adobe Creative Cloud": {
    method: "online",
    difficulty: "hard",
    url: "https://account.adobe.com/plans",
    steps: [
      "Go to Plans",
      "Manage Plan",
      "Cancel Plan",
      "WARNING: They might charge an 'Early Termination Fee'",
      "Chat with support if fee appears to waive it",
    ],
  },
  "Microsoft 365": {
    method: "online",
    difficulty: "medium",
    url: "https://account.microsoft.com/services",
    steps: [
      "Find subscription",
      "Manage",
      "Cancel subscription",
      "Turn off recurring billing",
    ],
  },
  Slack: {
    method: "online",
    difficulty: "medium",
    url: "https://my.slack.com/admin/settings#billing",
    steps: [
      "Workspace Settings",
      "Billing",
      "Change Plan",
      "Downgrade to Free",
    ],
  },
  Zoom: {
    method: "online",
    difficulty: "medium",
    url: "https://zoom.us/billing/plan",
    steps: [
      "Account Management",
      "Billing",
      "Current Plans",
      "Cancel Subscription",
    ],
  },
  LinkedIn: {
    method: "online",
    difficulty: "medium",
    url: "https://www.linkedin.com/premium/cancel",
    steps: [
      "Access Premium features",
      "Manage Subscription",
      "Cancel subscription",
    ],
  },
  Notion: {
    method: "online",
    difficulty: "easy",
    url: "https://www.notion.so/settings/billing",
    steps: [
      "Settings & Members",
      "Billing",
      "Change Plan",
      "Downgrade to Free",
    ],
  },
  ChatGPT: {
    method: "online",
    difficulty: "easy",
    url: "https://chat.openai.com/#settings/DataControls",
    steps: ["Click 'My Plan'", "Manage my subscription", "Cancel Plan"],
  },

  // --- DESIGN & DEV ---
  Figma: {
    method: "online",
    difficulty: "medium",
    url: "https://www.figma.com/settings/billing",
    steps: ["Select Team", "Settings", "Billing", "Downgrade to Starter"],
  },
  Canva: {
    method: "online",
    difficulty: "easy",
    url: "https://www.canva.com/settings/billing",
    steps: [
      "Billing & Teams",
      "Subscriptions",
      "More actions",
      "Cancel subscription",
    ],
  },
  GitHub: {
    method: "online",
    difficulty: "easy",
    url: "https://github.com/settings/billing",
    steps: ["Billing and plans", "Edit", "Downgrade to Free"],
  },
  Vercel: {
    method: "online",
    difficulty: "medium",
    url: "https://vercel.com/dashboard/billing",
    steps: ["Settings", "Billing", "Hobby Plan (Downgrade)"],
  },

  // --- UTILITIES & OTHERS ---
  "Apple Services": {
    method: "store",
    difficulty: "easy",
    steps: [
      "Open Settings on iPhone",
      "Tap your Name",
      "Tap Subscriptions",
      "Select App",
      "Cancel",
    ],
  },
  "Google One": {
    method: "online",
    difficulty: "easy",
    url: "https://one.google.com/settings",
    steps: ["Cancel membership"],
  },
  Dropbox: {
    method: "online",
    difficulty: "medium",
    url: "https://www.dropbox.com/account/plan",
    steps: ["Cancel plan", "I still want to downgrade", "Confirm"],
  },
  NordVPN: {
    method: "online",
    difficulty: "hard",
    url: "https://my.nordaccount.com/billing/my-subscriptions/",
    steps: [
      "They hide the button well",
      "Go to Billing",
      "Subscriptions",
      "Manage",
      "Cancel auto-renewal",
      "Sometimes requires Chat Support",
    ],
  },
  "New York Times": {
    method: "online",
    difficulty: "hard",
    url: "https://myaccount.nytimes.com/seg/cancel",
    steps: [
      "They will try to make you call or chat",
      "Look for the tiny 'Cancel online' link if available",
    ],
  },
};

// Función helper para encontrar info aproximada
export function getCancellationInfo(
  serviceName: string,
): CancellationInfo | null {
  // Buscamos si el nombre del servicio contiene alguna clave de nuestra DB
  const key = Object.keys(CANCELLATION_DB).find((k) =>
    serviceName.toLowerCase().includes(k.toLowerCase()),
  );
  return key ? CANCELLATION_DB[key] : null;
}
