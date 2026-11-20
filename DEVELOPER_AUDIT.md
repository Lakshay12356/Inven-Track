# Inven Track — Developer Audit

**Date:** 2026-10-30  
**Auditor:** Claude Sonnet 4.6  
**Scope:** Security, Architecture, Accessibility, Responsiveness, Data Model  
**Stack:** Next.js 16 · Clerk (auth) · Supabase (Postgres + RLS) · Tailwind CSS · Three.js · Recharts

---

## Severity Legend

| Symbol | Severity | Meaning |
|--------|----------|---------|
| 🔴 | Critical | Exploitable in production or fundamentally broken |
| 🟠 | High | Data integrity or correctness risk |
| 🟡 | Medium | UX, accessibility, or maintainability gap |
| 🟢 | Low / Positive | Worth knowing; also what's done right |

---

## Summary Scorecard

| Area | Grade | Key Issue |
|------|-------|-----------|
| Route Protection | D | Middleware file never runs (wrong filename) |
| Role Enforcement | D | Client-side only — bypassable by URL |
| Data Security | C | RLS is the only guard; no server validation layer |
| Race Conditions | C | Stock decrement is not atomic |
| Multi-Tenancy | D | No org/workspace concept — single-user islands |
| Responsiveness | B | Warehouse page breaks on mobile |
| Accessibility | C | Several ARIA and label gaps |
| Error Handling | C | No error boundaries on data fetches |
| Architecture | C | Thick-client pattern; business logic in the browser |
| What's Good | ✅ | Clerk+JWT→Supabase pattern is correct; API route for delivery is right instinct |

---

## 🔴 CRITICAL ISSUES

---

### C-01 — Middleware File Has Wrong Name and Never Executes

**File:** `proxy.ts` (root)  
**Expected:** `middleware.ts` (root)

Next.js middleware **must** be named `middleware.ts` at the project root. The file `proxy.ts` is ignored entirely by the framework — it is never executed.

```
proxy.ts       ← never runs (wrong filename, Next.js ignores it)
middleware.ts  ← does not exist at root
```

**What the code intends to do:**
```ts
// proxy.ts — this code never runs in production
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();   // ← never called
  }
});
```

**Consequences:**
- Every route (`/dashboard`, `/warehouse`, `/profile`, `/api/*`) has zero **server-side** protection
- A raw HTTP request (curl, Postman, fetch from another app) to any page or API route bypasses Clerk entirely at the edge
- Server Components that call `auth()` may silently return null session instead of redirecting
- The only thing protecting pages right now is Clerk's **client-side** redirect — which is trivially bypassed by disabling JavaScript

**Fix:**
```bash
# In project root
mv proxy.ts middleware.ts
```

One command. Fixes the most critical gap in the entire app.

---

### C-02 — Role Enforcement is Client-Side Only (Delivery Partner Can Access `/warehouse`)

**File:** `app/components/layout/Sidebar.tsx` — role check is UI-only  
**File:** `app/warehouse/page.tsx` — no server-side role guard

The delivery partner's inability to see the Warehouse tab is enforced only by hiding it in the sidebar. If a delivery partner navigates directly to `http://yourapp.com/warehouse`, the page renders fully — Three.js scene, Add Product form, Dispatch Delivery form, and all data sheets load with the delivery partner's session.

```ts
// Sidebar.tsx — this is the ONLY role check for /warehouse
const navItems = allNavItems.filter(item => !item.role || item.role === role);
// Removing this filter (or just typing the URL) bypasses it entirely
```

A delivery partner can:
- Add products to the manager's inventory
- Dispatch deliveries on behalf of the manager
- Create branches
- Edit and delete inventory

**Fix — add a server-side guard in `app/warehouse/page.tsx`:**
```ts
import { auth } from '@clerk/nextjs/server';
import { getUserRole } from '@/app/lib/api/users';
import { redirect } from 'next/navigation';

export default async function WarehousePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const role = await getUserRole(userId);
  if (role !== 'manager') redirect('/dashboard');
  // ... rest of page
}
```

Or enforce it in the (now correctly named) `middleware.ts`:
```ts
const isManagerRoute = createRouteMatcher(['/warehouse(.*)']);
clerkMiddleware(async (auth, request) => {
  if (isManagerRoute(request)) {
    const session = await auth();
    const role = await getUserRole(session.userId);
    if (role !== 'manager') return NextResponse.redirect('/dashboard');
  }
});
```

---

### C-03 — New User Sign-Up Always Gets `manager` Role

**File:** `app/lib/api/users.ts:24`

```ts
await supabase.from('profiles').insert({
  id: clerkUserId,
  email,
  role: 'manager',   // ← hardcoded for ALL new users
  ...
})
```

`getOrCreateUser` is called the first time any authenticated user touches the app. Because role defaults to `'manager'`, any person who signs up through `/sign-up` gets full manager access — including creating products, dispatching deliveries, and creating branches.

There is no invite flow, no role selection, and no admin approval. A delivery partner who signs up themselves gets provisioned as a manager.

**Consequence:** The role system is effectively broken for new users in production.

**Fix options:**
1. **Invite-only delivery partners:** Manager generates an invite link with a signed token containing `role=delivery_partner`. Sign-up page reads the token and passes role to `getOrCreateUser`.
2. **Clerk Organizations:** Use Clerk's built-in org membership and roles — the org role maps to manager/delivery_partner.
3. **Short-term:** Add a `role` param to `getOrCreateUser` and pass it from the sign-up flow; default to `delivery_partner` for safety (least privilege).

---

### C-04 — Supabase Anon Key Exposed in Browser; RLS is the Only Guard

**File:** `app/lib/supabase-client.ts`

```ts
createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,          // public — expected
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,     // public — the risk
  ...
)
```

The Supabase anon key is intentionally public (it's prefixed `NEXT_PUBLIC_`). The intended security model is: **anon key is public + RLS policies on every table enforce per-user data isolation using the Clerk JWT**.

This only works if:
1. RLS is **enabled** on every table (`products`, `delivery_orders`, `delivery_order_items`, `branches`, `stores`, `notifications`, `profiles`, `delivery_partners`)
2. Every table has correct `SELECT`, `INSERT`, `UPDATE`, `DELETE` policies checking `auth.uid() = user_id`
3. The Clerk JWT template named `supabase` is configured in the Clerk dashboard and maps `sub` to the Supabase `auth.uid()`

If **any** table is missing an RLS policy or has RLS disabled, any authenticated user can read and write every other user's data by calling the Supabase REST API directly from their browser console:

```js
// Any logged-in user can run this in their browser console right now
const supabase = createClient(SUPABASE_URL, ANON_KEY);
const { data } = await supabase.from('products').select('*'); // returns ALL users' products if RLS is off
```

**Action items:**
- [ ] Verify `SELECT * FROM information_schema.tables` and confirm RLS is enabled on every table
- [ ] Audit all RLS policies in Supabase dashboard
- [ ] Add a Supabase migration that explicitly enables RLS and creates default-deny policies for every table

---

## 🟠 HIGH ISSUES

---

### H-01 — Stock Decrement is Not Atomic (Race Condition)

**File:** `app/api/delivery-orders/create/route.ts:53-65`

```ts
// Read current quantity
const { data: product } = await supabase.from('products').select('quantity').eq('id', item.productId).single();

// Compute new quantity (in JavaScript — not the DB)
const newQuantity = Math.max(0, product.quantity - item.quantity);

// Write back
await supabase.from('products').update({ quantity: newQuantity }).eq('id', item.productId);
```

This is a classic read-modify-write race condition. If two delivery orders for the same product are dispatched within the same millisecond:

```
Thread A reads qty = 50
Thread B reads qty = 50
Thread A writes 50 - 5 = 45
Thread B writes 50 - 3 = 47   ← overwrites A's write; actual should be 42
```

**Fix — use an atomic Postgres RPC:**
```sql
-- Supabase migration
CREATE OR REPLACE FUNCTION decrement_product_quantity(p_id uuid, delta int)
RETURNS int AS $$
  UPDATE products
  SET quantity = GREATEST(0, quantity - delta)
  WHERE id = p_id
  RETURNING quantity;
$$ LANGUAGE sql;
```

```ts
// In the API route
const { data } = await supabase.rpc('decrement_product_quantity', {
  p_id: item.productId,
  delta: item.quantity,
});
```

---

### H-02 — API Route Trusts `managerId` from Request Body

**File:** `app/api/delivery-orders/create/route.ts:10`

```ts
const { managerId, ... } = await request.json();
if (!managerId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

The `managerId` is taken from the **request body** — a value the client controls. A malicious client can pass any `managerId` and create delivery orders attributed to another manager. The check is only "is it present", not "does it match the authenticated user".

**Fix — derive managerId from the server-side Clerk session:**
```ts
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Use userId from session, not from request body
  const { customerName, customerAddress, customerPhone, items } = await request.json();
  // managerId = userId (from auth), not from body
}
```

---

### H-03 — Most Mutations Bypass the Server Entirely

All of these go **directly browser → Supabase** with no server API route:

| Operation | Path |
|-----------|------|
| Add Product | `addProduct()` → Supabase client (browser) |
| Update Product | `updateProduct()` → Supabase client (browser) |
| Delete Product | `deleteProduct()` → Supabase client (browser) |
| Add Branch | `addBranch()` → Supabase client (browser) |
| Update Delivery Status | `updateOrderStatus()` → Supabase client (browser) |

There is no server-side validation, no business rule enforcement, no audit logging, and no rate limiting for any of these. A client can send any payload directly to Supabase and it will be accepted as long as RLS passes.

**For industrial grade:** All mutations should go through Next.js Server Actions or API routes. The browser should never hold the Supabase key for writes — only reads with strict RLS. Server routes use the **service role key** (never exposed to browser) and enforce all business logic.

---

## 🟡 MEDIUM ISSUES

---

### M-01 — The `stores` Table is Dead Schema

`getOrCreateUser` auto-creates a `stores` record. But:
- No UI reads from `stores`
- Products are scoped to `user_id` directly, not `store_id`
- Branches are listed in the UI but have no product relationship
- The branch/store hierarchy in the DB is not reflected in the product data model

**Consequence:** "Multi-branch inventory tracking" (a core selling point) is not architecturally possible with the current data model. Moving products between branches, checking stock per-branch, branch-level reports — none of these are supported.

**To actually support multi-branch:** Add `branch_id` (FK) to the `products` table. Let managers assign stock to specific branches. The Warehouse 3D page could show which branch's stock is being managed.

---

### M-02 — No Multi-Tenancy / Organisation Model

Every record in the database has `user_id = manager's Clerk ID`. This means:

- One company cannot have multiple managers sharing the same product catalog
- A manager cannot invite team members to their workspace
- A delivery partner links to a manager only via `delivery_orders.manager_id` — there is no formal workspace membership
- There is no concept of a company, tenant, or organisation

**For B2B SaaS this is a first-class concern.** The fix is to introduce a `workspaces` table and scope all records to `workspace_id`, paired with Clerk's Organisation feature for membership management.

---

### M-03 — No Audit Trail

When stock changes or a delivery status changes, there is no record of:
- Who made the change
- When it was made
- What the value was before

For inventory management this is both a business requirement (dispute resolution, theft detection) and often a regulatory one.

**Fix:** Add a Postgres trigger or an `audit_log` table that captures every `INSERT`, `UPDATE`, `DELETE` with `changed_by`, `changed_at`, `table_name`, `row_id`, `old_value`, `new_value`.

---

### M-04 — No Real-Time Cross-Client Sync

If a manager and a delivery partner are both looking at the same data at the same time, they see stale data until they refresh. Supabase Realtime (`postgres_changes` channel) is built exactly for this and is not wired up anywhere.

**Example of what's missing:**
```ts
// Delivery partner's dashboard should update when manager assigns a new order
supabase
  .channel('delivery_orders')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'delivery_orders' }, payload => {
    // refresh active tasks
  })
  .subscribe();
```

---

### M-05 — Warehouse Page Not Responsive on Mobile

The warehouse layout is hardcoded:
```tsx
// app/warehouse/page.tsx
<div className="flex h-full overflow-hidden">
  <div className="relative flex-1 min-w-0 min-h-0">  {/* 3D canvas */}
  <div className="w-[300px] flex-shrink-0 ...">       {/* action panel — fixed 300px */}
```

On a 375px viewport (iPhone SE):
- The canvas gets ~75px of width — Three.js renders a sliver
- The 300px action panel pushes everything offscreen
- The data sheet slide-over (also wide) overflows

The dashboard, profile, and sign-in pages all look fine on mobile. The warehouse page is the exception.

**Fix:** Add a responsive breakpoint — stack vertically on mobile with the action panel as a bottom drawer, or show a "Best viewed on desktop" message below `lg:` breakpoint.

---

### M-06 — Accessibility Gaps

| Issue | Element | WCAG Criterion |
|-------|---------|----------------|
| 3D canvas `<canvas>` has no `aria-label` | `WarehouseThreeScene` | 1.1.1 Non-text Content |
| Status dropdowns missing `aria-haspopup="listbox"` | `DeliveryStatusCell` | 4.1.2 Name, Role, Value |
| Edit/delete icon-buttons have no `aria-label` | Inventory sheet rows | 4.1.2 Name, Role, Value |
| `<label>` elements not linked to inputs via `htmlFor`/`id` | All forms | 1.3.1 Info and Relationships |
| Theme toggle missing `aria-pressed` state | Header | 4.1.2 Name, Role, Value |
| Notification bell missing `aria-expanded` | Header | 4.1.2 Name, Role, Value |
| Margin percentage is colour-only (green = good) | Add Product form | 1.4.1 Use of Colour |
| No skip-to-content link | Layout | 2.4.1 Bypass Blocks |
| No keyboard trap management in slide-over panels | WarehouseDataSheet | 2.1.2 No Keyboard Trap |

---

### M-07 — No Error Boundaries on Data Fetches

The analytics dashboard and warehouse data sheets have no error boundaries. If Supabase returns an error (network drop, RLS rejection, rate limit), the component either:
- Throws and crashes the entire page with a white screen
- Shows blank with no user-facing message

**Fix:** Wrap each data-fetching section in a React `<ErrorBoundary>` with a retry button, or use TanStack Query's `isError` / `refetch` pattern.

---

### M-08 — No Input Sanitization or Server-Side Validation

Form validation is HTML-only:
```tsx
<input required />                    // browser enforces 'required'
<input type="number" min="1" />       // browser enforces min
```

A direct API call or a browser with validation disabled can insert:
- Products with `name = "<script>alert(1)</script>"`
- Negative quantities
- Duplicate SKUs
- Buy price higher than sale price
- Empty strings that pass `required` after trimming

Supabase will accept all of this unless DB constraints are defined. 

**Fix:** Add Postgres CHECK constraints and NOT NULL constraints in migrations. Add Zod validation at the start of every API route and Server Action.

---

## 🟢 WHAT IS DONE WELL

---

### G-01 — Clerk + JWT → Supabase is the Right Pattern

The pattern of attaching a Clerk JWT as a Bearer token to Supabase requests is the correct architecture for this stack. It means:
- No passwords or user data stored in your own DB (Clerk handles it)
- Supabase can verify the token server-side using Clerk's JWKS endpoint
- RLS policies can call `auth.uid()` and get the Clerk user ID reliably

This is the intended design. It scales. Don't change it.

---

### G-02 — The Delivery Create API Route is the Right Instinct

`/api/delivery-orders/create` is the only mutation that goes through a proper server route. It:
- Creates the order
- Decrements stock
- Fires low-stock and out-of-stock notifications
- Creates partner assignment notification

This is exactly the pattern every mutation should follow. The issue is it's the only one.

---

### G-03 — `getOrCreateUser` Idempotent Sync is Solid

The Clerk → Supabase profile sync is correctly idempotent — first call creates the profile, subsequent calls return the existing ID. Auto-provisioning a default branch and store for new managers is a nice touch.

---

### G-04 — Low-Stock Notification System is Wired Up

The notification infrastructure (insert to `notifications` table on low-stock / out-of-stock events) is correctly implemented in the delivery API route. The notifications dropdown in the UI reads from this table. The plumbing is there — it just needs Supabase Realtime to push them live instead of requiring a page refresh.

---

### G-05 — Server-Side Supabase Client Uses Clerk Auth Correctly

```ts
// app/lib/supabase-server.ts
const { getToken } = await auth();
const token = await getToken({ template: 'supabase' });
```

The server-side client correctly fetches the Clerk JWT server-side and attaches it to Supabase. This is the pattern API routes should expand on.

---

## The Bigger Picture: "Just a Web UI Over Supabase"

Right now the app's data flow looks like this:

```
Browser ──── Supabase anon key + Clerk JWT ────→ Supabase (RLS enforced)
  │
  └── (one exception) → /api/delivery-orders/create → Supabase (server-side)
```

This is a **thick-client** architecture. The browser is trusted to implement business logic. This is appropriate for a prototype or internal tool but has compounding problems at scale:

| Concern | Current State | Industrial Grade |
|---------|---------------|-----------------|
| Business logic | In React components and `lib/api/*.ts` (browser) | In server API routes / Server Actions |
| DB access | anon key in browser + RLS | service role key server-side only |
| Validation | HTML attributes only | Zod schemas in server routes |
| Audit trail | None | Postgres triggers / audit_log table |
| Transactions | None (read-modify-write) | Postgres functions / RPCs |
| Real-time | None | Supabase Realtime channels |
| Multi-tenancy | Single user = single workspace | workspace_id on all tables + Clerk Orgs |
| Rate limiting | None | Upstash Redis rate limiter on API routes |

**The migration path is incremental:**

1. Fix `middleware.ts` filename ← one command, done today
2. Add server-side role guard to `/warehouse` ← 10 lines
3. Fix `managerId` in delivery API route ← 5 lines  
4. Move `addProduct`, `updateProduct`, `deleteProduct` to Server Actions with Zod validation ← 2-3 days
5. Atomic stock decrement via Postgres RPC ← 1 day
6. Add `workspace_id` and multi-tenancy ← 1 week (breaking change)
7. Supabase Realtime for live dashboard ← 2 days
8. Audit log ← 1 day

Steps 1–3 are critical security fixes that should ship immediately. Steps 4–5 are correctness fixes for production. Steps 6–8 are growth-stage architecture.

---

## Quick Wins (Can Do Today)

```bash
# 1. Fix middleware filename
mv proxy.ts middleware.ts

# 2. Add warehouse route guard (app/warehouse/page.tsx)
# Convert to async server component, add auth() + role check

# 3. Fix managerId in delivery API route
# Read from auth() not from request.json()

# 4. Verify RLS in Supabase dashboard
# Check every table has RLS enabled + policies
```

---

*Audit by Claude Sonnet 4.6 — 2026-10-30*  
*Based on full codebase review + live browser testing*
