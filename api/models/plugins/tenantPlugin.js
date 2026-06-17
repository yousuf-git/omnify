import mongoose from "mongoose";
import { getTenantId } from "../../src/context/tenantContext.js";

// Global Mongoose plugin that makes every model tenant-aware without touching
// controller logic. It adds a `tenantId` field and transparently scopes all
// queries, writes and aggregations to the tenant active in tenantContext.
//
// Models opt out with `{ skipTenantPlugin: true }` in their schema options
// (used by the Tenant model itself, which lives above tenants).
export function tenantPlugin(schema) {
  if (schema.options.skipTenantPlugin) return;

  // Skip internal mongoose-sequence counter schemas (id/reference_value/seq) so we
  // never scope or rewrite the auto-increment counter collection.
  if (schema.path("seq") && schema.path("reference_value") && schema.path("id")) return;

  if (!schema.path("tenantId")) {
    schema.add({
      tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        index: true,
        default: null,
      },
    });
  }

  // Inject the tenant filter on every read/update/delete query.
  const scopeQuery = function () {
    const tenantId = getTenantId();
    if (!tenantId) return; // no context → unscoped (login, super-admin, scripts)
    const filter = this.getFilter();
    if (filter.tenantId === undefined) {
      this.where({ tenantId });
    }
  };

  schema.pre(/^find/, scopeQuery);
  schema.pre(/^count/, scopeQuery);
  schema.pre(/^update/, scopeQuery);
  schema.pre("replaceOne", scopeQuery);
  schema.pre("deleteOne", { query: true, document: false }, scopeQuery);
  schema.pre("deleteMany", scopeQuery);

  // Stamp tenantId on new documents.
  schema.pre("save", function (next) {
    const tenantId = getTenantId();
    if (tenantId && this.tenantId == null) {
      this.tenantId = tenantId;
    }
    next();
  });

  schema.pre("insertMany", function (next, docs) {
    const tenantId = getTenantId();
    if (tenantId && Array.isArray(docs)) {
      for (const doc of docs) {
        if (doc.tenantId == null) doc.tenantId = tenantId;
      }
    }
    next();
  });

  // Scope aggregation pipelines.
  schema.pre("aggregate", function () {
    const tenantId = getTenantId();
    if (!tenantId) return;
    const pipeline = this.pipeline();
    const alreadyScoped =
      pipeline.length > 0 &&
      pipeline[0].$match &&
      pipeline[0].$match.tenantId !== undefined;
    if (!alreadyScoped) {
      pipeline.unshift({ $match: { tenantId } });
    }
  });
}
