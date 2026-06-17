// Fixed, realistic sample data served by the sandbox. Keys are API endpoints
// (no leading slash, no query string). Anything not listed defaults to an empty list.

const states = [
  { _id: "st1", stateId: 1, stateName: "Maharashtra", isActive: true },
  { _id: "st2", stateId: 2, stateName: "Karnataka", isActive: true },
  { _id: "st3", stateId: 3, stateName: "Delhi", isActive: true },
];

const cities = [
  { _id: "ct1", cityId: 1, cityName: "Mumbai", stateId: states[0], isActive: true },
  { _id: "ct2", cityId: 2, cityName: "Pune", stateId: states[0], isActive: true },
  { _id: "ct3", cityId: 3, cityName: "Bengaluru", stateId: states[1], isActive: true },
  { _id: "ct4", cityId: 4, cityName: "New Delhi", stateId: states[2], isActive: true },
];

const itemGroups = [
  { _id: "ig1", itemGroupId: 1, itemGroupName: "Routers", isActive: true },
  { _id: "ig2", itemGroupId: 2, itemGroupName: "Cameras", isActive: true },
  { _id: "ig3", itemGroupId: 3, itemGroupName: "Cabling", isActive: true },
];

const items = [
  { _id: "it1", itemId: 1, itemName: "Dual-band Router AX1800", modelNoSKU: "RTR-AX1800", unit: "pcs", description: "WiFi 6 router", requiresInstallation: true, requiresSerialNumberManagement: true, itemGroupId: itemGroups[0], isActive: true },
  { _id: "it2", itemId: 2, itemName: "PoE Dome Camera 4MP", modelNoSKU: "CAM-D4MP", unit: "pcs", description: "Outdoor IP camera", requiresInstallation: true, requiresSerialNumberManagement: true, itemGroupId: itemGroups[1], isActive: true },
  { _id: "it3", itemId: 3, itemName: "Cat6 Cable 305m Box", modelNoSKU: "CBL-CAT6-305", unit: "box", description: "Solid copper", requiresInstallation: false, requiresSerialNumberManagement: false, itemGroupId: itemGroups[2], isActive: true },
  { _id: "it4", itemId: 4, itemName: "8-Port PoE Switch", modelNoSKU: "SW-POE8", unit: "pcs", description: "Managed switch", requiresInstallation: true, requiresSerialNumberManagement: true, itemGroupId: itemGroups[0], isActive: true },
];

const warehouses = [
  { _id: "wh1", warehouseId: 1, warehouseName: "Central DC — Mumbai", isActive: true },
  { _id: "wh2", warehouseId: 2, warehouseName: "South Hub — Bengaluru", isActive: true },
];

const resellers = [
  { _id: "rs1", resellerId: 1, resellerName: "BlueWave Distributors", address: "Andheri East", gstn: "27ABCDE1234F1Z5", cityId: cities[0], stateId: states[0], isActive: true },
];

const parties = [
  { _id: "pt1", partyId: 1, partyName: "Acme Retail Pvt Ltd", address: "MG Road", gstn: "29ABCDE9999F1Z2", cityId: cities[2], stateId: states[1], isActive: true },
  { _id: "pt2", partyId: 2, partyName: "Sunrise Electronics", address: "Connaught Place", gstn: "07ABCDE8888F1Z9", cityId: cities[3], stateId: states[2], isActive: true },
];

const stores = [
  { _id: "sr1", storeId: 1, storeName: "Acme — Koramangala", partyId: parties[0], cityId: cities[2], stateId: states[1], storeAddress: "80ft Road", storePinCode: "560034", smName: "R. Mehta", smContactNo: "9000000001", isActive: true },
  { _id: "sr2", storeId: 2, storeName: "Sunrise — CP Block A", partyId: parties[1], cityId: cities[3], stateId: states[2], storeAddress: "Block A", storePinCode: "110001", smName: "S. Khan", smContactNo: "9000000002", isActive: true },
];

const agency = [
  { _id: "ag1", agencyId: 1, agencyName: "FastTrack Field Services", agencyNumber: "AGN-001", cityId: cities[0], stateId: states[0], isActive: true },
];

const supportPerson = [
  { _id: "sp1", supportPersonId: 1, supportPersonName: "Imran Sheikh", supportPersonNumber: "9811111111", agencyId: agency[0], cityId: cities[0], stateId: states[0], isActive: true },
];

const ticketStatus = [
  { _id: "ts1", name: "Open", isActive: true },
  { _id: "ts2", name: "In Progress", isActive: true },
  { _id: "ts3", name: "Resolved", isActive: true },
  { _id: "ts4", name: "Closed", isActive: true },
];
const resolutionStatus = [
  { _id: "rst1", resolutionStatusName: "Pending", isActive: true },
  { _id: "rst2", resolutionStatusName: "Resolved", isActive: true },
];
const issueType = [
  { _id: "iss1", issueTypeName: "Hardware", isActive: true },
  { _id: "iss2", issueTypeName: "Installation", isActive: true },
];
const deliveryStatus = [
  { _id: "ds1", deliveryStatusName: "Delivered", isActive: true },
  { _id: "ds2", deliveryStatusName: "Dispatched", isActive: true },
];
const installationStatus = [
  { _id: "ins1", installationStatusName: "Installed", isActive: true },
  { _id: "ins2", installationStatusName: "Scheduled", isActive: true },
];
const stockInCategories = [
  { _id: "sic1", stockInCategoryId: 1, stockInCategoryName: "Purchase", isActive: true },
  { _id: "sic2", stockInCategoryId: 2, stockInCategoryName: "Return", isActive: true },
];
const stockOutCategories = [
  { _id: "soc1", stockOutCategoryId: 1, stockOutCategoryName: "Sale", isActive: true },
  { _id: "soc2", stockOutCategoryId: 2, stockOutCategoryName: "Transfer Out", isActive: true },
];
const logistics = [
  { _id: "lg1", logisticsProviderCategoryName: "In-House", isActive: true },
  { _id: "lg2", logisticsProviderCategoryName: "Third Party Courier", isActive: true },
];
const assignedTo = [{ _id: "at1", name: "Unassigned", isActive: true }];

const stockIns = [
  {
    _id: "sin1", stockInId: 1,
    partyId: parties[0], warehouseId: warehouses[0], stockInCategoryId: stockInCategories[0],
    invoiceNo: "INV-1001", date: "2026-05-01", stockInDate: "2026-05-02", notes: "Q2 replenishment — routers & cabling.",
    itemId: [items[0], items[2]],
    stockAdded: [4, 20],
    serialNo: [["RTRAX-1001", "RTRAX-1002", "RTRAX-1003", "RTRAX-1004"], []],
    isActive: true,
  },
  {
    _id: "sin2", stockInId: 2,
    partyId: parties[1], warehouseId: warehouses[1], stockInCategoryId: stockInCategories[0],
    invoiceNo: "INV-1002", date: "2026-05-17", stockInDate: "2026-05-18", notes: "Camera & switch batch.",
    itemId: [items[1], items[3]],
    stockAdded: [3, 5],
    serialNo: [["CAMD4-1001", "CAMD4-1002", "CAMD4-1003"], ["SWPOE8-1001", "SWPOE8-1002", "SWPOE8-1003", "SWPOE8-1004", "SWPOE8-1005"]],
    isActive: true,
  },
];
const stockOuts = [
  {
    _id: "sout1", stockOutId: 1,
    partyId: parties[0], storeId: stores[0], warehouseId: warehouses[0],
    stockOutCategoryId: stockOutCategories[0], logisticsProviderCategoryId: logistics[1],
    trackingNo: "TRK-55012", date: "2026-05-20", stockOutDate: "2026-05-21", invoiceNo: "SO-2001",
    notes: "Quarterly dispatch to Acme — Koramangala store.",
    // parallel per-item arrays (matches the form's save shape)
    itemId: [items[0], items[1], items[2]],
    quantity: [2, 1, 3],
    deliveryStatusId: [deliveryStatus[0], deliveryStatus[1], deliveryStatus[0]],
    installationStatusId: [installationStatus[0], installationStatus[1], null],
    serialNo: [["RTRAX-0001", "RTRAX-0002"], ["CAMD4-0001"], []],
    isActive: true,
  },
  {
    _id: "sout2", stockOutId: 2,
    partyId: parties[1], storeId: stores[1], warehouseId: warehouses[1],
    stockOutCategoryId: stockOutCategories[1], logisticsProviderCategoryId: logistics[0],
    trackingNo: "TRK-55044", date: "2026-06-02", stockOutDate: "2026-06-03", invoiceNo: "SO-2002",
    notes: "Stock transfer to Sunrise — CP Block A.",
    itemId: [items[3]],
    quantity: [4],
    deliveryStatusId: [deliveryStatus[1]],
    installationStatusId: [installationStatus[1]],
    serialNo: [["SWPOE8-01", "SWPOE8-02", "SWPOE8-03", "SWPOE8-04"]],
    isActive: true,
  },
];

const stockItems = [
  { _id: "stk1", stockItemId: 1, serialNo: "RTRAX-0001", itemId: items[0], hasTicket: true },
  { _id: "stk2", stockItemId: 2, serialNo: "RTRAX-0002", itemId: items[0], hasTicket: false },
  { _id: "stk3", stockItemId: 3, serialNo: "CAMD4-0001", itemId: items[1], hasTicket: false },
];

const itemStockRecords = [
  { _id: "isr1", itemStockRecordId: 1, itemId: items[0], openingStock: 120, remainingStock: 86, closingStock: 0, transactions: [] },
  { _id: "isr2", itemStockRecordId: 2, itemId: items[1], openingStock: 60, remainingStock: 22, closingStock: 0, transactions: [] },
  { _id: "isr3", itemStockRecordId: 3, itemId: items[2], openingStock: 40, remainingStock: 9, closingStock: 0, transactions: [] },
  { _id: "isr4", itemStockRecordId: 4, itemId: items[3], openingStock: 75, remainingStock: 51, closingStock: 0, transactions: [] },
];

const tickets = [
  { _id: "tk1", ticketId: "8F2A1C", ticketType: "INSTALLATION", callId: "CALL-9001", callIdDate: "2026-05-09", stockItemId: stockItems[0], ticketStatusId: ticketStatus[2], resolutionStatusId: resolutionStatus[1], issueTypeId: issueType[1], supportPersonId: supportPerson[0], storeId: stores[0], rating: 5, openingDate: "2026-05-10", resolutionDate: "2026-05-11", notes: "Mounted and configured", isActive: true },
  { _id: "tk2", ticketType: "SUPPORT", ticketId: "3B7D9E", callId: "CALL-9002", ticketStatusId: ticketStatus[1], issueTypeId: issueType[0], supportPersonId: supportPerson[0], storeId: stores[1], openingDate: "2026-05-22", notes: "Intermittent connectivity", isActive: true },
  { _id: "tk3", ticketType: "SUPPORT", ticketId: "C1A4F0", callId: "CALL-9003", ticketStatusId: ticketStatus[0], issueTypeId: issueType[0], storeId: stores[0], openingDate: "2026-06-01", notes: "Awaiting triage", isActive: true },
];

const users = [
  { _id: "usr1", name: "Sandbox Admin", email: "admin@sandbox.test", role: "admin", isActive: true },
  { _id: "usr2", name: "Maya Operator", email: "maya@sandbox.test", role: "staff", isActive: true },
  { _id: "usr3", name: "Dev Viewer", email: "view@sandbox.test", role: "viewer", isActive: true },
];

export const FIXTURES: Record<string, any[]> = {
  states,
  cities,
  "item-groups": itemGroups,
  items,
  warehouses,
  resellers,
  parties,
  stores,
  agency,
  "support-person": supportPerson,
  "ticket-status": ticketStatus,
  "resolution-status": resolutionStatus,
  "issue-type": issueType,
  "delivery-status": deliveryStatus,
  "installation-status": installationStatus,
  "stock-in-categories": stockInCategories,
  "stock-out-categories": stockOutCategories,
  "logistics-provider-categories": logistics,
  "assigned-to": assignedTo,
  "stock-ins": stockIns,
  "stock-outs": stockOuts,
  "stock-items": stockItems,
  "item-stock-records": itemStockRecords,
  ticket: tickets,
  users,
};

export default FIXTURES;
