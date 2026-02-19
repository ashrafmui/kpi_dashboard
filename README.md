# Tank Operations Analytics Dashboard

This project is a frontend analytics dashboard for monitoring CIP (Clean-in-Place) tank operation cycles at an industrial factory. Built as a technical coding exercise for Laminar.

**Live Demo:** https://kpi-dashboard-blue.vercel.app/

## Problem & Solution

The provided dataset contains 50 tank operation cycle records across 4 tanks, spanning roughly 30 days (Oct 19 – Nov 17, 2025). Each record includes start/end timestamps, measured resource usage (time, energy, water), and estimated resource savings achieved using Laminar's sensors.

The dashboard transforms this raw data into an interactive analytics tool that allows operators and stakeholders to:

- Understand total and per-cycle resource savings at a glance
- Compare actual resource usage against what it would have been without Laminar
- Identify which tanks contribute the most savings
- Filter by tank and date range, with all metrics updating reactively
- Drill into individual cycle details via a click-to-expand modal

## Technical & Architectural Choices

### Why Next.js

- **Server Components**: The App Router defaults to Server Components, so data loading and initial transformation run on the server and stay out of the client bundle. For a data dashboard, this keeps page loads fast.
- **File-based routing with layouts**: Nested layouts make it easy to share navigation and page chrome as the app grows.
- **Built-in API routes**: If the data source moves from static JSON to a live API, Next.js route handlers provide a backend layer without needing a separate server.
- **Ecosystem fit**: shadcn/ui and Tailwind CSS interface easily with Next.js making them the go to choice for building out the dashboard.

### Data Architecture

```
example.json → getTankData() → transformTankData() → components
              (access layer)  (normalize + type)
```

- **`types/tank.ts`** — TypeScript interface (`TankRecord`) defining the raw JSON shape. Acts as a contract between the external data source and the app. Inconsistencies like the capitalized `Water` field and `null` values are documented here.
- **`lib/TransformTank.ts`** — Normalizes raw data into `TransformedTankRecord`: consistent casing, camelCase fields, parsed dates, and pre-computed derived fields like savings percentages.
- **`lib/GetTankData.ts`** — Async access function that imports the static JSON and runs it through the transform. Designed so swapping to a `fetch()` call later requires changing only this one file.
- **`lib/AggregateTank.ts`** — Everything pulls from this file. KPI totals, baseline vs. actual comparisons, top-saver, daily breakdowns for charts.

The static JSON import was chosen for simplicity given the scope. In production, this would be replaced with a REST API or WebSocket connection, with caching/revalidation via Next.js `fetch()` options or a client-side library like SWR.

### Component Architecture

- **`DashboardClient`** — Client component that owns all filter state (tank selection, date range). Computes filtered data once, then passes it to KPI cards, charts, and the data table. This ensures every part of the dashboard stays in sync when filters change.
- **`KPICard`** — Generic, reusable card component. Knows nothing about tanks — just renders a title, value, and optional subtitle. This makes it trivially reusable for any future KPI.
- **`SavingsChart`** — Line chart showing daily savings per tank, toggleable between time/energy/water. Uses shadcn's `ChartContainer` and recharts.
- **`ComparisonChart`** — Area chart comparing actual resource usage vs. estimated baseline without Laminar. Visually communicates the value proposition.
- **`DataTable`** — Interactive table built on TanStack Table for sorting. Includes a footer that aggregates the currently displayed data. Row clicks open a detail modal.
- **`CycleDetailModal`** — Shows a single cycle's full breakdown with savings percentages, triggered by clicking any table row.

### Key Design Decisions

**Null water values are preserved, not coerced to 0.** Several records have `null` for water savings and metrics — these appear to be dry cycles or air purge steps where water wasn't used. The UI displays "N/A" for these rather than "0" because they represent fundamentally different things.

**Filters are lifted to a single parent component.** Initially, filters lived inside the DataTable. This was refactored so that one component owns filter state and all downstream components (KPIs, charts, table) receive the same filtered dataset. This is more work upfront but ensures data consistency — when you filter to "Tank 2," the KPI totals, chart lines, and table all reflect only Tank 2.

**Duration column was removed in favor of Process Time.** The dataset contains both wall-clock duration (derived from start/end timestamps) and metered process time (from `metrics.time`). These are similar but not identical — the difference is likely idle/transition time. Showing both was confusing, so only the more precise metered value is displayed.

**Cost estimates use hardcoded US average utility rates** ($0.13/kWh, $0.005/gal). In production, these would be configurable per customer or region. The rates are defined as constants in one place for easy modification.

**Top saver KPIs are conditionally displayed.** They only appear when "All Tanks" is selected, since comparing a tank against itself when filtered doesn't provide useful information.

## What I Would Do Differently With More Time

- **Real-time data**: Replace the static JSON with a WebSocket connection or polling strategy to keep the dashboard current as new cycles complete.
- **URL-based filter state**: Persist filters in URL search params so filtered views can be shared via link and survive page refreshes.
- **Loading and error states**: The static import guarantees data availability, but a live API would need skeleton loaders, error boundaries, and retry logic.
- **Server-side pagination**: The 50-record dataset works fine client-side. At scale, filtering, sorting, and pagination would move to API query parameters.
- **Testing**: Unit tests for the aggregation functions (they're pure functions with well-defined inputs/outputs — ideal for testing). Integration tests for filter interactions.
- **Accessibility audit**: Ensure all interactive elements are keyboard navigable and screen reader friendly. The chart toggle buttons should have proper ARIA roles.
- **Configurable utility rates**: Allow customers to input their actual energy and water rates rather than using US averages.

## Project Structure

```
kpi_dashboard/
├── app/
│   ├── layout.tsx              # Root layout with dark mode
│   └── page.tsx                # Dashboard page (server component)
├── components/
│   ├── ui/                     # shadcn base components
│   ├── tank-table/
│   │   ├── columns.tsx         # Table column definitions
│   │   └── data-table.tsx      # Interactive data table
│   ├── comparison-chart.tsx    # Actual vs baseline area chart
│   ├── cycle-detail-modal.tsx  # Per-cycle detail modal
│   ├── dashboard-client.tsx    # Client wrapper owning filter state
│   ├── KPICard.tsx             # Reusable KPI display card
│   └── savings-chart.tsx       # Savings trend line chart
├── data/
│   └── example.json            # Static dataset
├── lib/
│   ├── aggregate-tank-data.ts  # All aggregation logic
│   ├── GetTankData.ts          # Data access layer
│   └── TransformTank.ts        # Data normalization
├── types/
│   └── tank.ts                 # Raw data TypeScript interface
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone <repository-url>
cd kpi_dashboard
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts (via shadcn chart components)
- **Table**: TanStack Table
- **Deployment**: Vercel

## AI Tools Used

This project was built with assistance from **Claude (Anthropic)**. Claude was used as a collaborative development partner for:

- **Architecture planning**: Discussing data flow patterns, deciding where to place types vs. transforms vs. aggregation logic, and reasoning through the tradeoffs of different approaches (e.g., static import vs. API route, server vs. client components).
- **Component scaffolding**: Generating initial component structures that were then reviewed, modified, and integrated. Every component was understood and adjusted before inclusion — for example, the filter lifting refactor from table-local state to a shared parent component was a deliberate architectural decision discussed at length.
- **Data transformation logic**: Working through how to normalize the raw JSON (handling null values, inconsistent casing, timestamp parsing) and designing the aggregation functions.
- **Debugging**: Identifying issues like CSS variable naming conflicts with spaces in tank names, and TypeScript type mismatches during refactoring.
- **Commit message drafting**: Generating concise, conventional commit messages throughout development.

All code was reviewed for correctness and understanding before committing. The architectural decisions, data interpretations (e.g., identifying potential dry cycles from null water values), and UX choices (e.g., preserving null as "N/A" rather than coercing to 0) reflect my own judgment informed by the collaborative process.

