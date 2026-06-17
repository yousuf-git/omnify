// Canonical sandbox seed — realistic US data. Cross-references use local string
// `key`s; scripts/seedSandbox.js resolves them to ObjectIds on insert. Every field
// of every entity is populated. Keyed by resourceKey (see src/sandbox/maps.js).

const ACTIVE = { isActive: true, deletedAt: null };

export const SEED = {
  states: [
    { key: "st_ca", stateId: 1, stateName: "California", ...ACTIVE },
    { key: "st_tx", stateId: 2, stateName: "Texas", ...ACTIVE },
    { key: "st_ny", stateId: 3, stateName: "New York", ...ACTIVE },
  ],

  cities: [
    { key: "ct_la", cityId: 1, cityName: "Los Angeles", stateId: "st_ca", ...ACTIVE },
    { key: "ct_sf", cityId: 2, cityName: "San Francisco", stateId: "st_ca", ...ACTIVE },
    { key: "ct_aus", cityId: 3, cityName: "Austin", stateId: "st_tx", ...ACTIVE },
    { key: "ct_dal", cityId: 4, cityName: "Dallas", stateId: "st_tx", ...ACTIVE },
    { key: "ct_nyc", cityId: 5, cityName: "New York City", stateId: "st_ny", ...ACTIVE },
    { key: "ct_buf", cityId: 6, cityName: "Buffalo", stateId: "st_ny", ...ACTIVE },
  ],

  "item-groups": [
    { key: "ig_net", itemGroupId: 1, itemGroupName: "Networking", ...ACTIVE },
    { key: "ig_cam", itemGroupId: 2, itemGroupName: "Surveillance", ...ACTIVE },
    { key: "ig_cbl", itemGroupId: 3, itemGroupName: "Cabling & Accessories", ...ACTIVE },
  ],

  items: [
    { key: "it_router", itemId: 1, itemGroupId: "ig_net", itemName: "Dual-Band Wi-Fi 6 Router AX1800", modelNoSKU: "RTR-AX1800", unit: "ea", description: "802.11ax dual-band router, 1.8 Gbps.", requiresInstallation: true, requiresSerialNumberManagement: true, ...ACTIVE },
    { key: "it_switch", itemId: 2, itemGroupId: "ig_net", itemName: "8-Port Gigabit PoE+ Switch", modelNoSKU: "SW-POE8-G", unit: "ea", description: "Managed PoE+ switch, 130W budget.", requiresInstallation: true, requiresSerialNumberManagement: true, ...ACTIVE },
    { key: "it_cam", itemId: 3, itemGroupId: "ig_cam", itemName: "4MP PoE Dome Camera", modelNoSKU: "CAM-D4MP", unit: "ea", description: "Outdoor IP67 dome camera, 4MP, IR.", requiresInstallation: true, requiresSerialNumberManagement: true, ...ACTIVE },
    { key: "it_nvr", itemId: 4, itemGroupId: "ig_cam", itemName: "16-Channel NVR 4TB", modelNoSKU: "NVR-16-4TB", unit: "ea", description: "16ch network video recorder, 4TB.", requiresInstallation: false, requiresSerialNumberManagement: true, ...ACTIVE },
    { key: "it_cat6", itemId: 5, itemGroupId: "ig_cbl", itemName: "Cat6 Cable Box 1000ft", modelNoSKU: "CBL-CAT6-1K", unit: "box", description: "Solid copper, riser-rated, blue.", requiresInstallation: false, requiresSerialNumberManagement: false, ...ACTIVE },
    { key: "it_rack", itemId: 6, itemGroupId: "ig_cbl", itemName: "12U Wall-Mount Rack", modelNoSKU: "RCK-12U-WM", unit: "ea", description: "Hinged wall-mount network rack.", requiresInstallation: true, requiresSerialNumberManagement: false, ...ACTIVE },
  ],

  warehouses: [
    { key: "wh_west", warehouseId: 1, warehouseName: "West DC — Los Angeles", ...ACTIVE },
    { key: "wh_cen", warehouseId: 2, warehouseName: "Central DC — Dallas", ...ACTIVE },
  ],

  resellers: [
    { key: "rs_blue", resellerId: 1, resellerName: "BlueWave Distributors LLC", address: "4500 W Sunset Blvd", gstn: "95-1234567", shippingAddress: "4500 W Sunset Blvd, Dock 3", cityId: "ct_la", stateId: "st_ca", ...ACTIVE },
    { key: "rs_lone", resellerId: 2, resellerName: "Lone Star Supply Co.", address: "2100 E 7th St", gstn: "74-7654321", shippingAddress: "2100 E 7th St, Bay 2", cityId: "ct_aus", stateId: "st_tx", ...ACTIVE },
  ],

  parties: [
    { key: "pt_acme", partyId: 1, partyName: "Acme Retail Corp", address: "1200 Market St", gstn: "94-2233445", shippingAddress: "1200 Market St, Suite 100", resellerId: "rs_blue", cityId: "ct_sf", stateId: "st_ca", ...ACTIVE },
    { key: "pt_sun", partyId: 2, partyName: "Sunrise Electronics Inc.", address: "800 Congress Ave", gstn: "74-9988776", shippingAddress: "800 Congress Ave, Loading B", resellerId: "rs_lone", cityId: "ct_aus", stateId: "st_tx", ...ACTIVE },
    { key: "pt_metro", partyId: 3, partyName: "Metro Systems Group", address: "350 5th Ave", gstn: "13-4455667", shippingAddress: "350 5th Ave, Fl 21", resellerId: null, cityId: "ct_nyc", stateId: "st_ny", ...ACTIVE },
  ],

  agency: [
    { key: "ag_ftt", agencyId: 1, agencyName: "FastTrack Field Services", agencyNumber: "AGN-1001", cityId: "ct_la", stateId: "st_ca", ...ACTIVE },
    { key: "ag_prime", agencyId: 2, agencyName: "Prime Install Partners", agencyNumber: "AGN-1002", cityId: "ct_dal", stateId: "st_tx", ...ACTIVE },
  ],

  "support-person": [
    { key: "sp_jdoe", supportPersonId: 1, agencyId: "ag_ftt", supportPersonName: "James Doe", supportPersonNumber: "+1-310-555-0142", cityId: "ct_la", stateId: "st_ca", ...ACTIVE },
    { key: "sp_mlee", supportPersonId: 2, agencyId: "ag_prime", supportPersonName: "Maria Lee", supportPersonNumber: "+1-214-555-0188", cityId: "ct_dal", stateId: "st_tx", ...ACTIVE },
  ],

  "assigned-to": [
    { key: "at_unassigned", name: "Unassigned", ...ACTIVE },
    { key: "at_tier2", name: "Tier 2 Support", ...ACTIVE },
  ],

  "stock-in-categories": [
    { key: "sic_po", stockInCategoryId: 1, stockInCategoryName: "Purchase Order", description: "Inbound from supplier PO.", ...ACTIVE },
    { key: "sic_ret", stockInCategoryId: 2, stockInCategoryName: "Customer Return", description: "Returned goods restocked.", ...ACTIVE },
  ],

  "stock-out-categories": [
    { key: "soc_sale", stockOutCategoryId: 1, stockOutCategoryName: "Sale", description: "Outbound customer sale.", ...ACTIVE },
    { key: "soc_xfer", stockOutCategoryId: 2, stockOutCategoryName: "Transfer Out", description: "Inter-warehouse transfer.", ...ACTIVE },
  ],

  "delivery-status": [
    { key: "ds_del", deliveryStatusId: 1, deliveryStatusName: "Delivered", description: "Received by customer.", ...ACTIVE },
    { key: "ds_tran", deliveryStatusId: 2, deliveryStatusName: "In Transit", description: "Out for delivery.", ...ACTIVE },
    { key: "ds_disp", deliveryStatusId: 3, deliveryStatusName: "Dispatched", description: "Left the warehouse.", ...ACTIVE },
  ],

  "installation-status": [
    { key: "is_done", installationStatusId: 1, installationStatusName: "Installed", description: "Installation complete.", ...ACTIVE },
    { key: "is_sched", installationStatusId: 2, installationStatusName: "Scheduled", description: "Visit scheduled.", ...ACTIVE },
    { key: "is_na", installationStatusId: 3, installationStatusName: "Not Required", description: "No install needed.", ...ACTIVE },
  ],

  "resolution-status": [
    { key: "rst_pend", resolutionStatusId: 1, resolutionStatusName: "Pending", description: "Awaiting resolution.", ...ACTIVE },
    { key: "rst_res", resolutionStatusId: 2, resolutionStatusName: "Resolved", description: "Issue resolved.", ...ACTIVE },
  ],

  "issue-type": [
    { key: "iss_hw", issueTypeId: 1, issueTypeName: "Hardware Fault", description: "Defective hardware.", ...ACTIVE },
    { key: "iss_inst", issueTypeId: 2, issueTypeName: "Installation", description: "Installation request.", ...ACTIVE },
    { key: "iss_net", issueTypeId: 3, issueTypeName: "Connectivity", description: "Network/connectivity issue.", ...ACTIVE },
  ],

  "ticket-status": [
    { key: "ts_open", ticketStatusId: 1, name: "Open", description: "Newly created.", ...ACTIVE },
    { key: "ts_prog", ticketStatusId: 2, name: "In Progress", description: "Being worked on.", ...ACTIVE },
    { key: "ts_res", ticketStatusId: 3, name: "Resolved", description: "Work complete.", ...ACTIVE },
    { key: "ts_closed", ticketStatusId: 4, name: "Closed", description: "Ticket closed.", ...ACTIVE },
  ],

  "logistics-provider-categories": [
    { key: "lpc_inhouse", logisticsProviderCategoryId: 1, logisticsProviderCategoryName: "In-House Fleet", ...ACTIVE },
    { key: "lpc_3pl", logisticsProviderCategoryId: 2, logisticsProviderCategoryName: "Third-Party Courier", ...ACTIVE },
  ],

  stores: [
    { key: "sr_acme_sf", storeId: 1, partyId: "pt_acme", storeName: "Acme — Union Square", cityId: "ct_sf", stateId: "st_ca", storeAddress: "333 Post St", storePinCode: "94108", smName: "Robert Hayes", smContactNo: "+1-415-555-0110", ...ACTIVE },
    { key: "sr_sun_aus", storeId: 2, partyId: "pt_sun", storeName: "Sunrise — Downtown", cityId: "ct_aus", stateId: "st_tx", storeAddress: "601 Congress Ave", storePinCode: "78701", smName: "Karen Mills", smContactNo: "+1-512-555-0123", ...ACTIVE },
    { key: "sr_metro_ny", storeId: 3, partyId: "pt_metro", storeName: "Metro — Midtown", cityId: "ct_nyc", stateId: "st_ny", storeAddress: "1500 Broadway", storePinCode: "10036", smName: "Daniel Cho", smContactNo: "+1-212-555-0177", ...ACTIVE },
  ],

  "stock-ins": [
    { key: "sin1", stockInId: 1, itemId: ["it_router", "it_cat6"], stockAdded: [40, 25], partyId: "pt_acme", warehouseId: "wh_west", stockInCategoryId: "sic_po", invoiceNo: "PO-10241", date: "2026-05-01T00:00:00.000Z", stockInDate: "2026-05-02T00:00:00.000Z", notes: "Q2 networking replenishment.", ...ACTIVE },
    { key: "sin2", stockInId: 2, itemId: ["it_cam", "it_nvr"], stockAdded: [30, 8], partyId: "pt_sun", warehouseId: "wh_cen", stockInCategoryId: "sic_po", invoiceNo: "PO-10255", date: "2026-05-17T00:00:00.000Z", stockInDate: "2026-05-18T00:00:00.000Z", notes: "Surveillance batch for retail rollout.", ...ACTIVE },
  ],

  "stock-outs": [
    { key: "sout1", stockOutId: 1, itemId: ["it_router", "it_cat6"], logisticsProviderCategoryId: "lpc_3pl", logisticsProviderCategoryName: "", storeId: "sr_acme_sf", deliveryStatusId: ["ds_del", "ds_disp"], installationStatusId: ["is_done", "is_na"], partyId: "pt_acme", stockOutCategoryId: "soc_sale", warehouseId: "wh_west", quantity: [4, 10], trackingNo: "1Z-A12-3456", date: "2026-05-20T00:00:00.000Z", stockOutDate: "2026-05-21T00:00:00.000Z", invoiceNo: "SO-22001", notes: "Dispatch to Acme — Union Square.", serialNo: [["RTRAX-0001", "RTRAX-0002", "RTRAX-0003", "RTRAX-0004"], []], ...ACTIVE },
    { key: "sout2", stockOutId: 2, itemId: ["it_cam"], logisticsProviderCategoryId: "lpc_inhouse", logisticsProviderCategoryName: "", storeId: "sr_sun_aus", deliveryStatusId: ["ds_tran"], installationStatusId: ["is_sched"], partyId: "pt_sun", stockOutCategoryId: "soc_sale", warehouseId: "wh_cen", quantity: [6], trackingNo: "FL-77-8890", date: "2026-06-01T00:00:00.000Z", stockOutDate: "2026-06-02T00:00:00.000Z", invoiceNo: "SO-22014", notes: "Camera order, install scheduled.", serialNo: [["CAMD4-1001", "CAMD4-1002", "CAMD4-1003", "CAMD4-1004", "CAMD4-1005", "CAMD4-1006"]], ...ACTIVE },
  ],

  "stock-items": [
    { key: "stk1", stockItemId: 1, serialNo: "RTRAX-0001", itemId: "it_router", stockInId: "sin1", stockOutId: "sout1", hasTicket: true },
    { key: "stk2", stockItemId: 2, serialNo: "RTRAX-0002", itemId: "it_router", stockInId: "sin1", stockOutId: "sout1", hasTicket: false },
    { key: "stk3", stockItemId: 3, serialNo: "RTRAX-0050", itemId: "it_router", stockInId: "sin1", stockOutId: null, hasTicket: false },
    { key: "stk4", stockItemId: 4, serialNo: "CAMD4-1001", itemId: "it_cam", stockInId: "sin2", stockOutId: "sout2", hasTicket: false },
    { key: "stk5", stockItemId: 5, serialNo: "NVR16-0001", itemId: "it_nvr", stockInId: "sin2", stockOutId: null, hasTicket: false },
  ],

  "item-stock-records": [
    { key: "isr1", itemStockRecordId: 1, itemId: "it_router", stockInId: "sin1", stockOutId: "sout1", openingStock: 0, closingStock: 0, remainingStock: 36, transactions: [
      { date: "2026-05-02T00:00:00.000Z", quantity: 40, type: "Stock-In", reference: "PO-10241" },
      { date: "2026-05-21T00:00:00.000Z", quantity: 4, type: "Stock-Out", reference: "SO-22001" },
    ] },
    { key: "isr2", itemStockRecordId: 2, itemId: "it_cat6", stockInId: "sin1", stockOutId: "sout1", openingStock: 0, closingStock: 0, remainingStock: 15, transactions: [
      { date: "2026-05-02T00:00:00.000Z", quantity: 25, type: "Stock-In", reference: "PO-10241" },
      { date: "2026-05-21T00:00:00.000Z", quantity: 10, type: "Stock-Out", reference: "SO-22001" },
    ] },
    { key: "isr3", itemStockRecordId: 3, itemId: "it_cam", stockInId: "sin2", stockOutId: "sout2", openingStock: 0, closingStock: 0, remainingStock: 24, transactions: [
      { date: "2026-05-18T00:00:00.000Z", quantity: 30, type: "Stock-In", reference: "PO-10255" },
      { date: "2026-06-02T00:00:00.000Z", quantity: 6, type: "Stock-Out", reference: "SO-22014" },
    ] },
    { key: "isr4", itemStockRecordId: 4, itemId: "it_nvr", stockInId: "sin2", stockOutId: null, openingStock: 0, closingStock: 0, remainingStock: 8, transactions: [
      { date: "2026-05-18T00:00:00.000Z", quantity: 8, type: "Stock-In", reference: "PO-10255" },
    ] },
  ],

  ticket: [
    { key: "tk1", ticketId: "8F2A1C", ticketType: "INSTALLATION", ticketStatusId: "ts_res", resolutionStatusId: "rst_res", supportPersonId: "sp_jdoe", issueTypeId: "iss_inst", stockItemId: "stk1", storeId: "sr_acme_sf", assignedToId: "at_tier2", openingDate: "2026-05-22T00:00:00.000Z", resolutionDate: "2026-05-23T00:00:00.000Z", callId: "CALL-9001", callIdDate: "2026-05-21T00:00:00.000Z", rating: 5, pictures: [] },
    { key: "tk2", ticketId: "3B7D9E", ticketType: "SUPPORT", ticketStatusId: "ts_prog", resolutionStatusId: "rst_pend", supportPersonId: "sp_mlee", issueTypeId: "iss_net", stockItemId: "stk4", storeId: "sr_sun_aus", assignedToId: "at_unassigned", openingDate: "2026-06-03T00:00:00.000Z", resolutionDate: null, callId: "CALL-9002", callIdDate: "2026-06-03T00:00:00.000Z", rating: 0, pictures: [] },
    { key: "tk3", ticketType: "SUPPORT", ticketId: "C1A4F0", ticketStatusId: "ts_open", resolutionStatusId: "rst_pend", supportPersonId: "sp_jdoe", issueTypeId: "iss_hw", stockItemId: "stk5", storeId: "sr_metro_ny", assignedToId: "at_unassigned", openingDate: "2026-06-10T00:00:00.000Z", resolutionDate: null, callId: "CALL-9003", callIdDate: "2026-06-10T00:00:00.000Z", rating: 0, pictures: [] },
  ],
};

export default SEED;
