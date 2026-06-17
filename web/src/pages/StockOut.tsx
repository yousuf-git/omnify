import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type {
  DeliveryStatus,
  FilterStockOut,
  InstallationStatus,
  Item,
  ItemStockRecord,
  LogisticsProviderCategory,
  Party,
  StockOut,
  StockOutCategory,
  Warehouse,
} from "../api/types";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources } from "../api/api";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { StockOutFilterPanel } from "../components/filter/StockOutFilterPanel";
import { StockOutList } from "../components/common/StockOutList";

export default function StockOutPage() {
  const navigate = useNavigate();
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterStockOut>({
    search: "",
    itemId: "",
    partyId: "",
    logisticsProviderCategoryId: "",
    stockOutCategoryId: "",
    warehouseId: "",
    dateFrom: "",
    dateTo: "",
    deliveryStatusId: "",
    installationStatusId: "",
  });
  const [items, setItems] = useState<Item[]>([]);
  const [logisticsProviderCategory, setLogisticsProviderCategory] = useState<
    LogisticsProviderCategory[]
  >([]);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus[]>([]);
  const [installationStatus, setInstallationStatus] = useState<
    InstallationStatus[]
  >([]);
  const [itemStockRecord, setItemStockRecord] = useState<ItemStockRecord[]>([]);
  const [party, setParty] = useState<Party[]>([]);
  const [warehouse, setWarehouse] = useState<Warehouse[]>([]);
  const [stockOutCategory, setStockOutCategory] = useState<StockOutCategory[]>(
    []
  );
  const [editDialog, setEditDialog] = useState({
    open: false,
    stockOut: null as StockOut | null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    stockOut: null as StockOut | null,
    loading: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data in parallel
      const [
        stockOutsResponse,
        itemsResponse,
        logisticsProviderCategoriesResponse,
        deliveryStatusResponse,
        installationStatusResponse,
        categoriesResponse,
        partiesResponse,
        itemStockRecordResponse,
        warehousesResponse,
      ] = await Promise.all([
        getResources("/stock-outs"),
        getResources("/items?showInactive=true"),
        getResources("/logistics-provider-categories?showInactive=true"),
        getResources("/delivery-status?showInactive=true"),
        getResources("/installation-status?showInactive=true"),
        getResources("/stock-out-categories?showInactive=true"),
        getResources("/parties?showInactive=true"),
        getResources("/item-stock-records"),
        getResources("/warehouses?showInactive=true"),
      ]);

      // Set all state with the responses
      setStockOuts(Array.isArray(stockOutsResponse) ? stockOutsResponse : []);
      setItems(Array.isArray(itemsResponse) ? itemsResponse : []);
      setLogisticsProviderCategory(
        Array.isArray(logisticsProviderCategoriesResponse)
          ? logisticsProviderCategoriesResponse
          : []
      );
      setDeliveryStatus(
        Array.isArray(deliveryStatusResponse) ? deliveryStatusResponse : []
      );
      setStockOutCategory(
        Array.isArray(categoriesResponse) ? categoriesResponse : []
      );
      setInstallationStatus(
        Array.isArray(installationStatusResponse)
          ? installationStatusResponse
          : []
      );
      setParty(Array.isArray(partiesResponse) ? partiesResponse : []);
      setItemStockRecord(
        Array.isArray(itemStockRecordResponse) ? itemStockRecordResponse : []
      );
      setWarehouse(Array.isArray(warehousesResponse) ? warehousesResponse : []);
    } catch (err: any) {
      console.error("Error loading data:", err);
      showSnackbar(`Error: ${err.message}`, "error");
      setError(err instanceof Error ? err.message : "Failed to load data");

      // Reset all states on error
      setStockOuts([]);
      setItems([]);
      setLogisticsProviderCategory([]);
      setDeliveryStatus([]);
      setInstallationStatus([]);
      setParty([]);
      setStockOutCategory([]);
      setItemStockRecord([]);
      setWarehouse([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ---- lookup maps for fast name resolution in the record list ----
  const mapBy = (rows: any[]) => new Map(rows.map((r) => [r._id, r]));
  const partyMap = useMemo(() => mapBy(party), [party]);
  const warehouseMap = useMemo(() => mapBy(warehouse), [warehouse]);
  const categoryMap = useMemo(() => mapBy(stockOutCategory), [stockOutCategory]);
  const logisticsMap = useMemo(() => mapBy(logisticsProviderCategory), [logisticsProviderCategory]);
  const deliveryMap = useMemo(() => mapBy(deliveryStatus), [deliveryStatus]);
  const installMap = useMemo(() => mapBy(installationStatus), [installationStatus]);
  const itemMap = useMemo(() => mapBy(items), [items]);

const filteredStockOuts = useMemo(() => {
  if (!stockOuts) return [];

  const result = stockOuts.filter((stockOut) => {
    // Use itemId array since items array doesn't exist in your data
    const stockOutItems = stockOut.itemId || [];

    // Add null checks for all ID fields
    const partyId = stockOut.partyId
      ? typeof stockOut.partyId === "object"
        ? (stockOut.partyId as any)._id
        : stockOut.partyId
      : null;

    const stockOutCategoryId = stockOut.stockOutCategoryId
      ? typeof stockOut.stockOutCategoryId === "object"
        ? (stockOut.stockOutCategoryId as any)._id
        : stockOut.stockOutCategoryId
      : null;

    const logisticsProviderCategoryId = stockOut.logisticsProviderCategoryId
      ? typeof stockOut.logisticsProviderCategoryId === "object"
        ? (stockOut.logisticsProviderCategoryId as any)._id
        : stockOut.logisticsProviderCategoryId
      : null;

    const warehouseId = stockOut.warehouseId
      ? typeof stockOut.warehouseId === "object"
        ? (stockOut.warehouseId as any)._id
        : stockOut.warehouseId
      : null;

    // Search filter
    const searchTerm = (filters.search || "").toLowerCase();

    // Find related entities for search with null checks
    const itemNames = stockOutItems
      .map((item: any) => {
        // Access item name from the item object
        return typeof item === 'object' ? item.itemName || '' : '';
      })
      .filter((name: string) => name)
      .map((name: string) => name.toLowerCase());

    const partyObj = stockOut.partyId
      ? typeof stockOut.partyId === "object"
        ? stockOut.partyId
        : party.find((p) => p._id === partyId)
      : null;

    const sicObj = stockOut.stockOutCategoryId
      ? typeof stockOut.stockOutCategoryId === "object"
        ? stockOut.stockOutCategoryId
        : stockOutCategory.find((c) => c._id === stockOutCategoryId)
      : null;

    const category = stockOut.logisticsProviderCategoryId
      ? typeof stockOut.logisticsProviderCategoryId === "object"
        ? stockOut.logisticsProviderCategoryId
        : logisticsProviderCategory.find(
            (c) => c._id === logisticsProviderCategoryId
          )
      : null;

    const warehouseObj = stockOut.warehouseId
      ? typeof stockOut.warehouseId === "object"
        ? stockOut.warehouseId
        : warehouse.find((w) => w._id === warehouseId)
      : null;

    const matchesSearch =
      !searchTerm ||
      stockOut.stockOutId?.toString().toLowerCase().includes(searchTerm) ||
      itemNames.some((name: string) => name.includes(searchTerm)) ||
      ((partyObj as any)?.partyName?.toLowerCase() || "").includes(
        searchTerm
      ) ||
      ((sicObj as any)?.stockOutCategoryName?.toLowerCase() || "").includes(
        searchTerm
      ) ||
      (
        (category as any)?.logisticsProviderCategoryName?.toLowerCase() || ""
      ).includes(searchTerm) ||
      ((warehouseObj as any)?.warehouseName?.toLowerCase() || "").includes(
        searchTerm
      ) ||
      (stockOut.trackingNo?.toLowerCase() || "").includes(searchTerm) ||
      (stockOut.invoiceNo?.toLowerCase() || "").includes(searchTerm);

    // FIXED: Item filter logic
    const matchesItem = !filters.itemId || stockOutItems.some((item: any) => {
      if (!item) return false;
      
      let actualItemId: string = '';
      
      // Handle different item formats
      if (typeof item === 'object' && item !== null) {
        // Item is a populated object - extract the ID
        actualItemId = item._id || item.$oid || '';
      } else if (typeof item === 'string') {
        // Item is already a string ID
        actualItemId = item;
      }
      
      return actualItemId === filters.itemId;
    });

    // Party filter - only apply if partyId exists
    const matchesParty =
      !filters.partyId || (partyId && partyId === filters.partyId);

    const matchesStockOutCategory =
      !filters.stockOutCategoryId ||
      (stockOutCategoryId &&
        stockOutCategoryId === filters.stockOutCategoryId);

    // Category filter - only apply if category exists
    const matchesCategory =
      !filters.logisticsProviderCategoryId ||
      (logisticsProviderCategoryId &&
        logisticsProviderCategoryId === filters.logisticsProviderCategoryId);

    // Warehouse filter - only apply if warehouse exists
    const matchesWarehouse =
      !filters.warehouseId ||
      (warehouseId && warehouseId === filters.warehouseId);

    // Date filters
    const stockOutDate = stockOut.date ? new Date(stockOut.date) : null;
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

    const matchesDateFrom =
      !fromDate || !stockOutDate || stockOutDate >= fromDate;
    const matchesDateTo = !toDate || !stockOutDate || stockOutDate <= toDate;

    // Delivery status filter - adjust based on your actual data structure
    const matchesDeliveryStatus =
      !filters.deliveryStatusId ||
      (stockOut.deliveryStatusId && 
       Array.isArray(stockOut.deliveryStatusId) &&
       stockOut.deliveryStatusId.some((ds: any) => {
         const dsId = typeof ds === 'object' ? ds._id : ds;
         return dsId === filters.deliveryStatusId;
       }));

    // Installation status filter - adjust based on your actual data structure
    const matchesInstallationStatus =
      !filters.installationStatusId ||
      (stockOut.installationStatusId && 
       Array.isArray(stockOut.installationStatusId) &&
       stockOut.installationStatusId.some((is: any) => {
         const isId = typeof is === 'object' ? is._id : is;
         return isId === filters.installationStatusId;
       }));

    const shouldInclude =
      matchesSearch &&
      matchesItem &&
      matchesParty &&
      matchesStockOutCategory &&
      matchesCategory &&
      matchesWarehouse &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesDeliveryStatus &&
      matchesInstallationStatus;

    return shouldInclude;
  });

  return result;
}, [
  stockOuts,
  filters.search,
  filters.itemId,
  filters.partyId,
  filters.stockOutCategoryId,
  filters.logisticsProviderCategoryId,
  filters.warehouseId,
  filters.dateFrom,
  filters.dateTo,
  filters.deliveryStatusId,
  filters.installationStatusId,
  party,
  logisticsProviderCategory,
  warehouse,
  stockOutCategory,
]);


// useEffect(() => {
//   console.log('StockOuts data:', stockOuts);
//   console.log('Items data:', filters.itemId);
//   console.log('Filtered StockOuts count:', items);
//   if (stockOuts.length > 0) {
//     console.log('First stockOut items structure:', stockOuts[0].items);
//     console.log('First stockOut itemId structure:', stockOuts[0].itemId);
//   }
// }, [stockOuts, filters.itemId]);

  const handleEdit = (stockOut: StockOut) => {
    navigate(`/stock-out-details/${stockOut._id}`);
  };

  const handleDelete = (stockOut: StockOut) => {
    setDeleteDialog({ open: true, stockOut, loading: false });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.stockOut) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      await deleteResource("/stock-outs", deleteDialog.stockOut._id as string);
      setStockOuts((prev) =>
        prev.filter((item) => item._id !== deleteDialog.stockOut!._id)
      );
      showSnackbar("Stock-Out record deleted successfully", "success");
    } catch (error) {
      console.error("Delete error:", error);
      showSnackbar(
        error instanceof Error
          ? error.message
          : "Failed to delete stock-Out record",
        "error"
      );
    } finally {
      setDeleteDialog({ open: false, stockOut: null, loading: false });
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      itemId: "",
      partyId: "",
      stockOutCategoryId: "",
      logisticsProviderCategoryId: "",
      warehouseId: "",
      dateFrom: "",
      dateTo: "",
      deliveryStatusId: "",
      installationStatusId: "",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="flex flex-col">
      {/* Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end", justifyContent: "space-between", mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "stretch", gap: 1.5 }}>
          <Box sx={{ width: "3px", borderRadius: "2px", bgcolor: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Stock-Out</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Outbound inventory movements & deliveries
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search stock-outs…"
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            sx={{ width: { xs: "100%", sm: 260 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} style={{ opacity: 0.6 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => navigate("/StockOutForm")}
          >
            New stock-out
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <StockOutFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        items={items}
        parties={party}
        logisticsProviderCategory={logisticsProviderCategory}
        deliveryStatus={deliveryStatus}
        installationStatus={installationStatus}
        itemStockRecord={itemStockRecord}
        warehouses={warehouse}
      />

      {/* Record list */}
      <StockOutList
        records={filteredStockOuts}
        itemMap={itemMap}
        partyMap={partyMap}
        warehouseMap={warehouseMap}
        categoryMap={categoryMap}
        logisticsMap={logisticsMap}
        deliveryMap={deliveryMap}
        installMap={installMap}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditItemDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, stockOut: null })}
        type="stockOut"
        item={editDialog.stockOut}
        onSuccess={loadAllData}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, stockOut: null, loading: false })
        }
        onConfirm={confirmDelete}
        isLoading={deleteDialog.loading}
        config={{
          title: "Delete Stock-Out Record",
          description: `Are you sure you want to delete stock-Out record #${deleteDialog.stockOut?.stockOutId}?`,
          confirmText: "Delete",
          cancelText: "Cancel",
          loadingText: "Deleting...",
        }}
        severity="error"
        actionVariant="delete"
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
