import { AsyncLocalStorage } from "node:async_hooks";

// Request-scoped sandbox context. Holds the active sandbox sessionId so the
// generic sandbox CRUD layer scopes every read/write to that session's copy.
export const sandboxStore = new AsyncLocalStorage();

export const runWithSandbox = (ctx, fn) => sandboxStore.run(ctx, fn);
export const getSandboxSessionId = () => sandboxStore.getStore()?.sessionId;
export const isSandboxActive = () => Boolean(sandboxStore.getStore()?.sessionId);
