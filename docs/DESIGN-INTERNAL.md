# Omnify — Internal Product Design Philosophy (Stripe-grade)

Authoritative design language for the **internal app** — dashboard + all management / activity / form pages behind login. This is an operational tool for data entry, analytics, and daily use. It must feel like a real product (Stripe-grade), NOT like the bold public marketing site.

> Do NOT copy the public Neo-Brutalism language (`DESIGN-PUBLIC.md`) into the system. Different audience, different purpose. Design per the **nature of the data, the task, and the operator's day**.

---

## 1. Philosophy
- **Calm, dense, confident.** Clean white surfaces, restrained color, generous-but-efficient spacing. Reads enterprise/operational without being loud.
- **Design for the data, not a template.** Think about what the operator scans for, enters fastest, and references. Reduce font sizes, add hierarchy, choose layouts that fit the data shape.
- **No sideways scroll, ever.** Wide column tables are banned for rich records. Use card record-lists that wrap/stack.
- **Symmetry.** Filters and forms use uniform grids; nothing sits lopsided or alone.
- **Micro-interactions that feel smooth**, never gimmicky: eased expand/collapse, hover border highlight, copy-to-clipboard with confirm.

## 2. Foundations (single source of truth: `web/src/theme/`)
- **Tokens** (`tokens.ts`): soft radius — cards ~12px, inputs/buttons 6–8px. Soft layered shadows (paired with a 1px border) — never hard offsets. Indigo brand `#635BFF`, ink `#0A2540`, neutral grays.
- **Type** (`theme.ts`): calm sans hierarchy. Headings = Space Grotesk (clean geometric), body/labels = Manrope. `overline` = **sans gray uppercase micro-label** (NOT monospace). Numerals in cards = Space Grotesk, tight.
- **Components**: Cards = 1px border + soft `shadow.xs`. Table headers = small gray sans, light tracking. Buttons/inputs lightly rounded.
- Use semantic tokens (`text.secondary`, `action.hover`, `divider`, `primary.main`) — never hardcoded hex (no `#f5f5f5` / `#f9f9f9`).

## 3. Page anatomy (the standard)

### Read / list view
- **Card record-list** (templates: `components/common/StockOutList.tsx`, `StockInList.tsx`, `TicketList.tsx`). Each record is a labeled grid (overline label + value via a `Field` helper).
- Hierarchy: primary facts bold + icon; secondary as caption; tertiary (invoice/tracking/notes) in a footer strip.
- Surface ALL meaningful fields (e.g. both dates if the entity has two). Counts = icon + number (parcel icon + N), not a wordy phrase.
- **Expandable row** (chevron, framer height-auto) reveals line items / full detail; serialized items get a **barcode modal with search + copy**.
- Status chips carry icons and semantic color.
- **Top pagination toolbar**: `N entries · showing X–Y`, per-page select (10/20/50/100), page nav (first/last). Quick glance up top, not buried.
- Empty-state card.

### Filters
- **Search lives in the page header, top-right** (next to the primary action) — NOT inside the filter panel.
- Filter panel = Card, **collapsed by default**, toggled by a **filter icon** (SlidersHorizontal), active-count badge + Clear.
- Controls in a **uniform responsive grid** (`repeat(2/3/4,1fr)`).

### Entry form
- Line items as **cards** in a fluid wrapping grid (never a wide scrolling table).
- Detail fields in a **symmetric 2-col grid** (`{xs:'1fr', md:'1fr 1fr'}`); pair lone fields.
- **Full width** (no maxWidth centering). **Single header** — if a `*Details` wrapper page also renders a header, drop it (the form owns it).
- Sub-panels flat: `elevation={0}` + `1px solid divider`. Read-only fields themed (`action.hover`), not hardcoded.

### Shell / sidebar
- Flex shell (`components/applayout/Index.tsx`), AppBar offset, max-width container.
- Sidebar (`components/common/NavigationDrawer.tsx`): groups shown directly (no "Configure" button), ordered by usage, logout pinned bottom, active indigo bar, icon-rail + tooltips when collapsed, **mobile auto-compacts** (`useMediaQuery('(max-width:900px)')`).

## 4. Implementation gotchas
- **Animation:** use framer `AnimatePresence` + `motion.div` height-auto for expand/collapse (MUI `Collapse` read as instant here). Define row/group renderers as **plain functions or module-level components** — never inline-in-component (inline → new identity each render → remount → animation dies).
- **Data shape:** movement docs (stock-in/out) store **parallel arrays** by item index — `itemId[]`, `quantity[]`/`stockAdded[]`, `deliveryStatusId[]`, `installationStatusId[]`, `serialNo[][]`. Refs may be populated objects OR ids; resolve both. Two dates: `date` = Document Date, `stockOutDate`/`stockInDate` = movement date.
- **Sandbox:** custom endpoints like `/storeByPartyId/:id` are NOT mocked (return `[]`) → fall back to filtering already-loaded collections locally. Keep `web/src/sandbox/fixtures.ts` well cross-referenced so features are testable.
- **Verify:** `cd web && npx tsc -b` then `npx vite build` must pass. eslint is NOT in the build; the repo has many pre-existing `any`/unused-var warnings — fix only ones you introduce. NEVER change business logic (handlers, validation, save payloads) — UI/UX only.

## 5. Progress
Redesigned to this standard: **Dashboard, Stock Out, Stock In, Tickets** (rich card record-lists), plus the **master-data CRUD pages** — Items, Item Groups, Warehouses, Stores, Item Status, Stock Transactions, Parties, Resellers, Agencies, Support Persons, Assigned To, Users, City, State, Settings, and the status/category lookups (Delivery/Installation/Resolution/Issue/Ticket status, Stock In/Out categories, Logistics provider). Master-data pages keep the themed `DynamicTable` (few columns, no scroll problem) but get the standard header (accent bar + title + header search + "New X"), collapsible filter panels where they had one, and full-width/flat/symmetric forms. Search always lives in the page header (the old shared `GenericFilterPanel` search box was removed from these pages to avoid a duplicate).
