// Maps the frontend resource endpoints to Mongoose model names + the reference
// graph used when cloning seed data into a fresh session (ids must be remapped).

// resourceKey (normalised endpoint, no leading slash / query) -> Mongoose model name
export const RESOURCE_TO_MODEL = {
  states: "State",
  cities: "City",
  "item-groups": "ItemGroup",
  items: "Item",
  resellers: "Reseller",
  parties: "Party",
  agency: "Agency",
  "support-person": "SupportPerson",
  "assigned-to": "AssignedTo",
  warehouses: "Warehouse",
  stores: "Store",
  "stock-in-categories": "StockInCategory",
  "stock-out-categories": "StockOutCategory",
  "delivery-status": "DeliveryStatus",
  "installation-status": "InstallationStatus",
  "resolution-status": "ResolutionStatus",
  "issue-type": "IssueType",
  "ticket-status": "TicketStatus",
  "logistics-provider-categories": "LogisticsProviderCategory",
  "stock-items": "StockItem",
  "item-stock-records": "ItemStockRecord",
  "stock-ins": "StockIn",
  "stock-outs": "StockOut",
  ticket: "Ticket",
};

// Per-resource reference fields. { field, array, target } — target is a resourceKey.
// Used to remap ObjectIds when cloning the canonical seed into a session.
export const REF_GRAPH = {
  cities: [{ field: "stateId", target: "states" }],
  items: [{ field: "itemGroupId", target: "item-groups" }],
  resellers: [
    { field: "cityId", target: "cities" },
    { field: "stateId", target: "states" },
  ],
  parties: [
    { field: "resellerId", target: "resellers" },
    { field: "cityId", target: "cities" },
    { field: "stateId", target: "states" },
  ],
  agency: [
    { field: "cityId", target: "cities" },
    { field: "stateId", target: "states" },
  ],
  "support-person": [
    { field: "agencyId", target: "agency" },
    { field: "cityId", target: "cities" },
    { field: "stateId", target: "states" },
  ],
  stores: [
    { field: "partyId", target: "parties" },
    { field: "cityId", target: "cities" },
    { field: "stateId", target: "states" },
  ],
  "stock-items": [
    { field: "itemId", target: "items" },
    { field: "stockInId", target: "stock-ins" },
    { field: "stockOutId", target: "stock-outs" },
  ],
  "item-stock-records": [
    { field: "itemId", target: "items" },
    { field: "stockInId", target: "stock-ins" },
    { field: "stockOutId", target: "stock-outs" },
  ],
  "stock-ins": [
    { field: "itemId", target: "items", array: true },
    { field: "partyId", target: "parties" },
    { field: "warehouseId", target: "warehouses" },
    { field: "stockInCategoryId", target: "stock-in-categories" },
  ],
  "stock-outs": [
    { field: "itemId", target: "items", array: true },
    { field: "logisticsProviderCategoryId", target: "logistics-provider-categories" },
    { field: "storeId", target: "stores" },
    { field: "deliveryStatusId", target: "delivery-status", array: true },
    { field: "installationStatusId", target: "installation-status", array: true },
    { field: "partyId", target: "parties" },
    { field: "stockOutCategoryId", target: "stock-out-categories" },
    { field: "warehouseId", target: "warehouses" },
  ],
  ticket: [
    { field: "ticketStatusId", target: "ticket-status" },
    { field: "resolutionStatusId", target: "resolution-status" },
    { field: "supportPersonId", target: "support-person" },
    { field: "issueTypeId", target: "issue-type" },
    { field: "stockItemId", target: "stock-items" },
    { field: "storeId", target: "stores" },
    { field: "assignedToId", target: "assigned-to" },
  ],
};

// All resource keys (independent → dependent) so a session clone inserts in order.
export const RESOURCE_ORDER = [
  "states",
  "cities",
  "item-groups",
  "items",
  "warehouses",
  "resellers",
  "parties",
  "agency",
  "support-person",
  "assigned-to",
  "stores",
  "stock-in-categories",
  "stock-out-categories",
  "delivery-status",
  "installation-status",
  "resolution-status",
  "issue-type",
  "ticket-status",
  "logistics-provider-categories",
  "stock-ins",
  "stock-outs",
  "stock-items",
  "item-stock-records",
  "ticket",
];

// Normalise an endpoint ("/stock-outs?x=1" or "stock-outs") to a resourceKey.
export const normaliseResource = (raw = "") =>
  String(raw).replace(/^\/+/, "").split("?")[0].split("/")[0].trim();
