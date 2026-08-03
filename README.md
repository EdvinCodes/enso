# ENSO | Finance OS

<div align="center">
  <br />
  <a href="https://enso-three.vercel.app/">
    <h1 align="center" style="font-size: 3rem; font-weight: 900;">ENSO</h1>
  </a>

  <p align="center">
    <strong>Master your recurring expenses. Cloud-synced. Privacy-focused.</strong>
  </p>

  <p align="center">
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://supabase.com/">
      <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind" />
    </a>
    <a href="https://web.dev/progressive-web-apps/">
      <img src="https://img.shields.io/badge/PWA-Ready-purple?style=flat-square&logo=pwa" alt="PWA Ready" />
    </a>
  </p>
</div>

<br />

## ✨ Introduction

**ENSO** is a modern subscription and recurring-expense manager that stops you from bleeding money on forgotten services.

ENSO uses **Supabase** (Postgres + Auth) as its backend: your subscriptions, payment history and budgets are synced securely across all your devices, protected by Row Level Security so only you can ever read or write your own data.

It's also an **Installable PWA**: add it to your home screen on iOS, Android or Desktop for an app-like experience (the interface shell works offline, though creating/syncing data requires a connection).

## 🚀 Key Features

- **☁️ Cloud Sync:** Sign in with Email, Google or GitHub. Your data follows you across devices.
- **💳 Subscription CRUD:** Track recurring subscriptions and one-time expenses with price, currency, category and billing cycle.
- **🗄️ Archive & Restore:** Soft-delete subscriptions without losing their payment history; restore them anytime.
- **🧾 Payment History:** Log real payments (paid / skipped / pending) per subscription and see actual vs. projected spend.
- **🔮 Cashflow Forecast:** A 30-day predictive curve to visualize upcoming cumulative spending.
- **🏢 Workspaces:** Separate "Personal" expenses from "Business" overheads.
- **📅 Visual Calendar:** A monthly grid view to spot spending clusters and renewal dates.
- **💰 Budgets:** Set a monthly limit per category and track it against real spend.
- **🔔 Smart Notifications:** Native browser alerts a few days before a recurring payment is due.
- **🌍 Multi-Currency Support:** Track in USD, EUR or GBP with real-time FX normalization for KPIs (via the Frankfurter API, with offline fallback rates).
- **📊 Interactive Analytics:** Monthly Run Rate (MRR) and category distribution charts.
- **⚡ Command Palette (⌘K):** Navigate and manage subscriptions without touching the mouse.
- **📥 Import / Export:** Back up your data as JSON, or bulk-import from CSV.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, `proxy.ts` route protection)
- **Language:** TypeScript
- **Backend / Auth / DB:** [Supabase](https://supabase.com/) (Postgres, Auth, Row Level Security)
- **PWA Engine:** `next-pwa` + generated Service Worker
- **Styling:** Tailwind CSS 4, Framer Motion, `clsx`
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
- **State Management:** Zustand
- **Forms & Validation:** React Hook Form + Zod
- **Logic:** `date-fns` for recurring date algorithms
- **Charts:** Recharts

## 📦 Getting Started

Follow these steps to run ENSO locally on your machine.

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- A free [Supabase](https://supabase.com/) account/project

### 1. Clone the repository

```bash
git clone https://github.com/EdvinCodes/enso.git
cd enso
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure Supabase

ENSO requires a Supabase project for auth and data storage — there is no local/offline data store.

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings > API**, copy your **Project URL** and **anon public key**.
3. In the **SQL Editor**, run the migration in [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql). This creates the `subscriptions`, `payments` and `budgets` tables with Row Level Security policies.
4. In **Authentication > Providers**, enable **Email**. Optionally enable **Google** and/or **GitHub** for social login.
5. In **Authentication > URL Configuration**, add your callback URL as an allowed redirect URL:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

### 4. Set environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the development server

```bash
pnpm dev
```

### 6. Open your browser

Navigate to [http://localhost:3000](http://localhost:3000). Register an account, then you'll be redirected straight to the dashboard.

## 📂 Project Structure

```bash
src/
├── app/
│   ├── page.tsx            # Landing Page (Marketing)
│   ├── login/, register/   # Auth pages
│   ├── auth/callback/      # OAuth code exchange route
│   ├── dashboard/          # The actual App (auth-protected)
│   └── globals.css         # Tailwind & Global Styles
├── proxy.ts                 # Route protection (Next.js 16 Proxy, ex-middleware)
├── components/
│   ├── ui/                 # Shadcn reusable components
│   └── command-menu.tsx    # Command palette (⌘K)
├── features/
│   ├── subscriptions/      # Core Domain Logic (Components, Zustand Store, Zod Schema)
│   ├── calendar/           # Calendar View Logic
│   ├── dashboard/          # Forecast & KPI Charts
│   └── settings/           # Budgets, Archive, Backup/CSV import-export
├── lib/
│   ├── supabase.ts         # Supabase browser client
│   ├── dates.ts            # Centralized Date & Payment Logic
│   ├── forecast.ts         # Cashflow Projection Algorithms
│   ├── currency.ts         # Multi-currency FX normalization
│   └── notifications.ts    # Browser Notification API Logic
└── supabase/
    └── migrations/         # SQL schema & RLS policies
```

## 🔮 Roadmap

- [x] Core Subscription Management (CRUD)
- [x] Supabase Cloud Sync + Auth (Email, Google, GitHub)
- [x] Dashboard, Calendar & Budgets
- [x] Smart Notifications
- [x] PWA Support (Install on Mobile/Desktop)
- [x] Cashflow Forecast
- [ ] Automated tests (unit / e2e)
- [ ] End-to-End Encryption for sensitive fields
- [ ] Bank API Integration (Plaid/GoCardless)

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

---

<div align="center">
<p>Built with ❤️ by <a href="https://github.com/EdvinCodes">Edvin</a></p>
</div>
