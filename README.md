# Innovate Institute — School Management System (Frontend)

Frontend-only recreation of the Innovate Institute administration portal. There is
no backend and **no sample data** — every list, table, and chart renders its empty
state until a data source is connected.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4** — tokens defined in `app/globals.css`
- **shadcn/ui + Radix UI** — components in `components/ui/`
- **Lucide** icons, **Recharts** for charts

## Getting started

```bash
npm run dev
```

Then open http://localhost:3000 — `/` redirects to `/admin`.

## Routes

| Route | Purpose |
| --- | --- |
| `/admin` | Department landing page (2 departments in scope) |
| `/admin/students` | Student directory — search, class + status filters, profile modal |
| `/admin/students/enroll` | Enrollment form UI |
| `/admin/finance` | Summary cards, billings/collections chart, category donut, recent transactions |
| `/admin/finance/invoices` | Invoice table with status badges + invoice creation dialog |
| `/admin/finance/fees` | Per-band fee breakdown table |
| `/teacher` | Placeholder portal with its own sidebar |
| `/student` | Placeholder portal with its own sidebar |

## Design tokens

Mirrored from the live portal (`app/globals.css`):

- **Primary** `oklch(30% 0.15 250)` — deep navy
- **Accent** `oklch(65% 0.20 45)` — orange, used for active nav and primary actions
- **Radius** `0.625rem`, **Font** Inter

## Connecting a backend

`lib/data/` holds the data contract — types, enums, and display mappings, plus
empty exports standing in for real records:

- `lib/data/students.ts` — `Student`, `students`, `studentStats`, `CLASS_LEVELS`
- `lib/data/finance.ts` — `Invoice`, `invoices`, `feeStructure`, `financeSummary`,
  `revenueTrend`, `revenueByCategory`, `recentTransactions`

Replace each empty array/object with a query (e.g. Convex `useQuery`) while keeping
the exported **types** as the contract. The components that read them:

- `components/admin/student-directory.tsx` — `students`
- `components/admin/invoice-table.tsx` — `invoices`
- `components/admin/finance-charts.tsx` — `revenueTrend`, `revenueByCategory`
- `components/admin/create-invoice-dialog.tsx` — `students`, `feeStructure`

`CLASS_LEVELS` (ECD → Form 6) is school configuration rather than sample data, so
it is populated and drives the class filter rail and the enrollment form.

The signed-in user lives in `lib/navigation.ts` as `currentUser`, currently blank —
`components/layout/user-menu.tsx` falls back to a signed-out state until an auth
provider is wired up.

## Layout notes

`components/layout/portal-shell.tsx` is the shared chrome (sidebar + top bar +
content well). It takes a `portal` key rather than nav props — Lucide icons are
functions and cannot be passed from a server component into the client sidebar, so
`AppSidebar` looks its sections up from `lib/navigation.ts` internally.

## Empty states

`components/shared/empty-state.tsx` is used by the charts; tables render an inline
empty row. Both distinguish "no records at all" from "filtered to nothing" so the
copy stays accurate once real data lands.
