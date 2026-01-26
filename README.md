# ENSO | Finance OS

<div align="center">
  <br />
  <a href="https://enso-three.vercel.app/">
    <h1 align="center" style="font-size: 3rem; font-weight: 900;">ENSO</h1>
  </a>
  
  <p align="center">
    <strong>Master your recurring expenses. Privacy-first. Local-first.</strong>
  </p>

  <p align="center">
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind" />
    </a>
    <a href="https://web.dev/progressive-web-apps/">
      <img src="https://img.shields.io/badge/PWA-Ready-purple?style=flat-square&logo=pwa" alt="PWA Ready" />
    </a>
    <a href="https://dexie.org/">
      <img src="https://img.shields.io/badge/IndexedDB-Local-green?style=flat-square" alt="Local First" />
    </a>
  </p>
</div>

<br />

![Dashboard Preview](./public/preview.webp)

## ✨ Introduction

**ENSO** is a modern, privacy-focused subscription manager designed to stop you from bleeding money on forgotten services.

Unlike other finance apps, **ENSO has no backend**. It leverages the browser's **IndexedDB** to store all your sensitive financial data locally on your device. We cannot see your data, sell it, or leak it.

Now available as an **Installable PWA**, allowing you to manage your finances offline on iOS, Android, and Desktop.

## 🚀 Key Features

### 🆕 New in v2.4

- **📱 Native PWA:** Install ENSO on your phone. Works 100% offline.
- **🔮 Cashflow Forecast:** A 30-day predictive curve to visualize upcoming cumulative spending.
- **🏢 Workspaces:** Separate your "Personal" expenses from "Business" overheads effortlessly.

### Core Features

- **🛡️ Local-First Architecture:** Built with Dexie.js. Data never leaves your device.
- **⚡ God Mode (Cmd+K):** Navigate, search, and manage subscriptions without touching the mouse.
- **📅 Visual Calendar:** A monthly grid view to visualize spending clusters and renewal dates.
- **🔔 Smart Notifications:** Native system alerts 3 days before any payment is due (Serverless logic).
- **🌍 Multi-Currency Support:** Track in USD, EUR, or GBP with real-time normalization for KPIs.
- **📊 Interactive Analytics:** Monthly Run Rate (MRR) calculation and category distribution charts using Recharts.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **PWA Engine:** `next-pwa` + Custom Service Workers
- **Styling:** Tailwind CSS, Framer Motion, `clsx`
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
- **State Management:** Zustand (Global Store)
- **Database:** Dexie.js (Wrapper for IndexedDB)
- **Logic:** `date-fns` for complex recurring date algorithms
- **Charts:** Recharts

## 📦 Getting Started

Follow these steps to run ENSO locally on your machine.

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/EdvinCodes/enso.git
cd enso
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Run the development server**

```bash
pnpm run dev
```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the Landing Page.
   Click "Launch App" to access the Dashboard.

## 📂 Project Structure

```bash
src/
├── app/
│   ├── page.tsx            # Landing Page (Marketing)
│   ├── dashboard/          # The actual App (Protected route logic)
│   ├── icons/              # Dynamic PWA Icon generation
│   └── globals.css         # Tailwind & Global Styles
├── components/
│   ├── ui/                 # Shadcn reusable components
│   └── command-menu.tsx    # God Mode implementation
├── features/
│   ├── subscriptions/      # Core Domain Logic (Components, Store, Schema)
│   ├── calendar/           # Calendar View Logic
│   ├── dashboard/          # Forecast & KPI Charts
│   └── settings/           # Data Management (Backup/Restore)
├── lib/
│   ├── db.ts               # Database configuration (Dexie)
│   ├── dates.ts            # Centralized Date & Payment Logic
│   ├── forecast.ts         # Cashflow Projection Algorithms
│   └── notifications.ts    # Notification API Logic
└── public/                 # Static assets & Manifest
```

## 🔮 Roadmap

- [x] Core Subscription Management (CRUD)
- [x] Local Storage Persistence
- [x] Dashboard & Calendar Views
- [x] Smart Notifications
- [x] **PWA Support (Install on Mobile)**
- [x] **Cashflow Forecast**
- [ ] End-to-End Encryption Sync
- [ ] Bank API Integration (Plaid/GoCardless)

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
<p>Built with ❤️ by <a href="https://github.com/EdvinCodes">Edvin</a></p>
</div>
