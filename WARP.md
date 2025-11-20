# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository overview

This repository is intended to host the **Milkman Diary App**: a diary-style application for a milkman to manage daily milk deliveries, track multiple customers, and view monthly reports.

The current `README.md` describes the initial functional goals:
- Record customers and their milk quantities/prices.
- Track daily deliveries as diary entries.
- Generate monthly summaries (total milk sold, revenue, per-customer breakdown).
- Provide basic views/exports of reports.

As of now, there is no application source code or build configuration checked in; only `README.md` is present.

## Commands

### Development
```powershell
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Architecture and structure

This is a React + TypeScript single-page application built with Vite.

### Tech Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v7
- **State Management**: React Context API
- **Data Persistence**: Browser localStorage
- **Date Utilities**: date-fns
- **Icons**: lucide-react

### Project Structure
```
src/
├── types/          # TypeScript interfaces (Customer, DiaryEntry, MonthlySummary)
├── context/        # AppContext for global state and localStorage persistence
├── components/
│   ├── ui/         # Reusable UI components (Button, Input, Modal, Card)
│   ├── Layout.tsx  # Main layout with navigation
│   ├── CustomerForm.tsx / CustomerList.tsx
│   └── DeliveryForm.tsx / DeliveryList.tsx
├── pages/
│   ├── Dashboard.tsx  # Overview with stats and recent activity
│   ├── Customers.tsx  # Customer CRUD operations
│   ├── Diary.tsx      # Daily delivery entry
│   └── Reports.tsx    # Monthly summaries with CSV export
├── App.tsx         # Router configuration
└── main.tsx        # Application entry point
```

### Key Architectural Points

**State Management**: All application state (customers, diary entries) is managed through `AppContext` in `src/context/AppContext.tsx`. This context:
- Provides CRUD operations for customers and diary entries
- Automatically persists data to localStorage on every change
- Loads data from localStorage on app initialization

**Data Models**: Core types are defined in `src/types/index.ts`:
- `Customer`: name, defaultQuantity, pricePerUnit, phone, address
- `DiaryEntry`: customerId, date, quantity, amount, notes, delivered status
- `MonthlySummary`: computed aggregations (totalRevenue, totalQuantity, customerBreakdown)

**Date Format**: All dates are stored as ISO strings (YYYY-MM-DD) for consistency and easy filtering.

**Monthly Reports**: The Reports page (`src/pages/Reports.tsx`) computes monthly summaries on-the-fly by:
1. Filtering diary entries by selected month
2. Aggregating by customer using a Map
3. Calculating totals and per-customer breakdowns
4. Providing CSV export functionality

**Form Validation**: All forms implement client-side validation with real-time error feedback.
