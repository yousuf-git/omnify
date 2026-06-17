import { AsyncLocalStorage } from "node:async_hooks";

// Request-scoped tenant context. Holds the active tenantId (and super-admin flag)
// for the lifetime of a request so the Mongoose tenant plugin can auto-scope queries.
export const tenantStore = new AsyncLocalStorage();

// Run `fn` with the given tenant context active.
export const runWithTenant = (ctx, fn) => tenantStore.run(ctx, fn);

// Current tenantId, or undefined when no tenant context is active
// (e.g. login, super-admin, or system scripts).
export const getTenantId = () => tenantStore.getStore()?.tenantId;

// True when the active context belongs to a platform super-admin.
export const isSuperAdmin = () => Boolean(tenantStore.getStore()?.isSuperAdmin);
