# FinanceOS — Finance Dashboard

> A production-quality, single-file React Finance Dashboard with RBAC, dark mode, interactive charts, and full CRUD transaction management.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat&logo=tailwindcss) ![Recharts](https://img.shields.io/badge/Recharts-2.x-8884d8?style=flat) ![lucide-react](https://img.shields.io/badge/lucide--react-icons-gray?style=flat)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup & Usage](#setup--usage)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [RBAC Design](#rbac-design)
- [Data Model](#data-model)
- [Design System](#design-system)
- [Component Breakdown](#component-breakdown)
- [Known Limitations](#known-limitations)

---

## Overview

**FinanceOS** is a single-page Finance Dashboard built as one self-contained React component (`FinanceDashboard.jsx`). It simulates the internal finance tool of a fintech startup — with realistic mock data, role-based permissions, rich data visualisations, and a highly polished UI.

The component requires **no backend**, no build-time CSS extraction, and no component libraries beyond Recharts and lucide-react. Everything — state, logic, styles, mock data — lives in one file.

---

## Features

### 🏠 Dashboard Tab
- **4 Summary Cards** — Total Balance, Total Income, Total Expenses, Savings Rate
  - Count-up animation on mount using `requestAnimationFrame`
  - Trend arrows and contextual sub-labels
  - Color-coded savings rate (emerald ≥ 20%, amber 10–20%, rose < 10%)
- **Income vs Expenses Bar Chart** — 6-month dual-bar Recharts visualization with custom tooltip
- **Spending by Category Donut Chart** — animated PieChart with custom legend and hover tooltips

### 💳 Transactions Tab
- Paginated table (10 rows/page) with date, description, category icon, type badge, and amount
- **Real-time filtering**: search by description, filter by type/category/month, sort by date or amount
- Active filter badge count + "Clear all" button
- **Empty state** illustrated SVG when no results match
- **Admin-only actions**: Add, Edit (modal form), Delete (inline confirmation — no browser alert)
- **Export CSV / Export JSON** — uses `Blob` + `URL.createObjectURL` for client-side downloads

### 💡 Insights Tab
Six color-coded insight cards:
1. **Top Spending Category** — with animated progress bar
2. **Highest Spending Month** — with mini bar chart
3. **Highest Income Month** — with mini bar chart
4. **Monthly Average** — income vs expense comparison
5. **Savings Rate Trend** — improving/declining with sparkline
6. **Spending Streak** — consecutive months of Food & Dining < $500

### 🎨 UX & Design
- **Dark / Light mode toggle** — sun/moon icon in header, persistent for session
- **Sidebar navigation** on desktop; **bottom tab bar** on mobile
- **Skeleton shimmer** on first render (400 ms)
- **Row highlight flash** (yellow) for newly added transactions
- **Role switcher** with a sliding animated indicator pill
- Fully responsive: mobile (< 640 px), tablet, desktop layouts

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Styling | Tailwind CSS (utility-first) |
| Charts | Recharts (BarChart, PieChart, LineChart) |
| Icons | lucide-react |
| State | `useReducer` + `useState` + `useMemo` |
| Data | Static mock data (no backend) |
| Exports | Browser Blob API |

---

## Architecture

```
FinanceDashboard.jsx
├── Constants & Category Metadata
├── Mock Transaction Data (65 records, Jan–Jun 2024)
├── Helper Functions (fmt, fmtDate, getMonth, uniqueId)
├── Reducer (txReducer: ADD / EDIT / DELETE / CLEAR_NEW)
└── FinanceDashboard (default export)
    ├── State declarations
    │   ├── useReducer → transactions
    │   └── useState  → activeTab, role, dark, loading, filters, modal, confirmDelete
    ├── Derived Data (useMemo)
    │   ├── filtered & paginated transactions
    │   ├── summary stats
    │   ├── monthlyData (chart)
    │   ├── categoryData (donut)
    │   └── insights object
    ├── Handlers (export, modal, delete, save)
    ├── Theme helpers (dark/light class resolution)
    └── Inner Components (access parent closure directly)
        ├── CountUp
        ├── Skeleton
        ├── SummaryCard
        ├── BarTooltip / DonutTooltip
        ├── TxModal
        ├── DashboardTab
        ├── TransactionsTab
        └── InsightsTab
```

---

## Setup & Usage

### Prerequisites
Your React project must have these peer dependencies installed:

```bash
npm install recharts lucide-react
```

Tailwind CSS must be configured in your project (v3.x).

### Integration

1. Copy `FinanceDashboard.jsx` into your project's `src/` directory.
2. Import and render the component:

```jsx
// App.jsx
import FinanceDashboard from './FinanceDashboard';

export default function App() {
  return <FinanceDashboard />;
}
```

3. Ensure Tailwind's `content` array in `tailwind.config.js` includes the file:

```js
content: ['./src/**/*.{js,jsx,ts,tsx}'],
```

4. Start your dev server:

```bash
npm run dev
```

> The component is fully self-contained. No environment variables, API keys, or additional configuration are required.

---

## Project Structure

```
Zorvyn Assignment/
├── FinanceDashboard.jsx   ← The entire application (single file)
└── README.md              ← This documentation
```

---

## State Management

The app uses a three-tier state strategy:

### `useReducer` — Transactions (source of truth)
```js
txReducer(state, action)
  ADD       → prepends a new transaction with uniqueId()
  EDIT      → replaces transaction by id
  DELETE    → filters out transaction by id
  CLEAR_NEW → strips the _new flag after flash animation
```

### `useState` — UI State
| Variable | Purpose |
|---|---|
| `activeTab` | Current navigation tab |
| `role` | 'Admin' or 'Viewer' |
| `dark` | Dark mode toggle |
| `loading` | Skeleton shimmer state (first 400ms) |
| `search`, `filterType`, `filterCat`, `filterMonth`, `sortKey` | Filter/sort controls |
| `page` | Pagination cursor |
| `modal` | Modal open state, mode (add/edit), and prefill data |
| `confirmDelete` | ID of row pending inline delete confirmation |

### `useMemo` — Derived Data
All computed values are memoized to avoid unnecessary recalculation:
- `filtered` — filtered + sorted transaction list
- `paginated` — current page slice
- `summary` — total income, expenses, balance, savings rate
- `monthlyData` — aggregated per-month for bar chart
- `categoryData` — grouped expense percentages for donut chart
- `insights` — all six insight metrics

---

## RBAC Design

Role-based access is implemented as **presentational gating** — the `role` state controls what is rendered, not what data is fetched (since there is no backend).

| Feature | Admin | Viewer |
|---|---|---|
| View dashboard & charts | ✅ | ✅ |
| View transactions table | ✅ | ✅ |
| View insights | ✅ | ✅ |
| Add transaction (modal) | ✅ | ❌ |
| Edit transaction | ✅ | ❌ |
| Delete transaction | ✅ | ❌ |
| Export CSV / JSON | ✅ | ❌ |
| View-only banner | ❌ | ✅ |

The **role switcher** in the sidebar uses an animated sliding pill indicator. Switching roles immediately hides/shows action buttons and the modal guard, with no page reload.

---

## Data Model

Each transaction object follows this shape:

```ts
interface Transaction {
  id:          string;          // unique ID (auto-generated or 't001'-format)
  date:        string;          // ISO date string  e.g. '2024-01-15'
  description: string;          // Merchant/source name
  amount:      number;          // Positive number (USD)
  type:        'income' | 'expense';
  category:    Category;
  _new?:       boolean;         // Internal: triggers row highlight flash
}

type Category =
  | 'Salary' | 'Freelance'
  | 'Food & Dining' | 'Transport' | 'Shopping' | 'Entertainment'
  | 'Healthcare' | 'Utilities' | 'Rent' | 'Investments';
```

The dataset ships with **65 transactions** across Jan–Jun 2024, covering all 10 categories.

---

## Design System

| Token | Value |
|---|---|
| Primary accent | `indigo-600` |
| Income / positive | `emerald-500` |
| Expense / negative | `rose-500` |
| Warning | `amber-500` |
| Light background | `gray-50` |
| Dark background | `gray-900` |
| Card radius | `rounded-2xl` |
| Card padding | `p-5` / `p-6` |
| Typography | Inter → Segoe UI → system-ui |
| Transition | `duration-200` / `duration-300` |

---

## Component Breakdown

| Component | Description |
|---|---|
| `CountUp` | Animates a number from 0 to `target` on mount using `requestAnimationFrame` with cubic ease-out |
| `Skeleton` | Animated shimmer placeholder, adapts to dark/light mode |
| `SummaryCard` | Metric card with icon, accent colour, count-up value, trend indicator |
| `BarTooltip` | Custom Recharts tooltip for the monthly bar chart |
| `DonutTooltip` | Custom Recharts tooltip for the category donut chart |
| `TxModal` | Controlled form for adding/editing transactions with inline validation |
| `DashboardTab` | Summary cards + bar chart + donut chart layout |
| `TransactionsTab` | Filter toolbar + paginated table + export buttons |
| `InsightsTab` | Six themed insight cards with embedded micro-charts |

---

## Known Limitations

- **No persistence** — all state resets on page refresh. There is no `localStorage` or backend.
- **Session-scoped data** — added/edited transactions exist only for the current browser session.
- **No timezone awareness** — dates are parsed as local JS Date objects.
- **Single currency** — all amounts are treated as USD. No multi-currency support.
- **Mock data range** — data is hard-coded for Jan–Jun 2024. No dynamic date range.
- **No authentication** — RBAC is purely UI-level; the role switcher is openly accessible by design.

---

## License

This project was submitted as an assignment for **Zorvyn Inc**. All rights reserved.
