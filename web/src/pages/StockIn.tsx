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
  FilterStockIn,
  Item,
  ItemStockRecord,
  Party,
  StockIn,
  StockInCategory,
  Warehouse,
} from "../api/types";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources } from "../api/api";
import { StockInFilterPanel } from "../components/filter/StockInFilterPanel";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { StockInList } from "../components/common/StockInList";

export default function StockInPage() {
  const navigate = useNavigate();
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [filters, setFilters] = useState<FilterStockIn>({
  //     search: '',
  //     itemName: '',
  //     partyName: '',
  //     categoryName: '',
  //     dateFrom: '',
  //     dateTo: ''
  // });
  const [filters, setFilters] = useState<FilterStockIn>({});
  const [itemStockRecord, setItemStockRecord] = useState<ItemStockRecord[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [party, setParty] = useState<Party[]>([]);
  const [stockInCategory, setStockInCategory] = useState<StockInCategory[]>([]);
  const [warehouse, setWarehouse] = useState<Warehouse[]>([]);
  const [editDialog, setEditDialog] = useState({
    open: false,
    stockIn: null as StockIn | null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    stockIn: null as StockIn | null,
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
        stockInsResponse,
        itemsResponse,
        partiesResponse,
        categoriesResponse,
        warehousesResponse,
        stockRecordsResponse,
      ] = await Promise.all([
        getResources("/stock-ins"),
        getResources("/items?showInactive=true"),
        getResources("/parties?showInactive=true"),
        getResources("/stock-in-categories?showInactive=true"),
        getResources("/warehouses?showInactive=true"),
        getResources("/item-stock-records"),
      ]);

      // Set all state with the responses
      setStockIns(Array.isArray(stockInsResponse) ? stockInsResponse : []);
      setItems(Array.isArray(itemsResponse) ? itemsResponse : []);
      setParty(Array.isArray(partiesResponse) ? partiesResponse : []);
      setStockInCategory(
        Array.isArray(categoriesResponse) ? categoriesResponse : []
      );
      setWarehouse(Array.isArray(warehousesResponse) ? warehousesResponse : []);
      setItemStockRecord(
        Array.isArray(stockRecordsResponse) ? stockRecordsResponse : []
      );
    } catch (err:any) {
      console.error("Error loading data:", err);
       showSnackbar(`Error: ${err.message}`, "error");
      setError(err instanceof Error ? err.message : "Failed to load data");

      // Reset all states on error
      setStockIns([]);
      setItems([]);
      setParty([]);
      setStockInCategory([]);
      setWarehouse([]);
      setItemStockRecord([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ---- lookup maps for the record list ----
  const mapBy = (rows: any[]) => new Map(rows.map((r) => [r._id, r]));
  const itemMap = useMemo(() => mapBy(items), [items]);
  const partyMap = useMemo(() => mapBy(party), [party]);
  const warehouseMap = useMemo(() => mapBy(warehouse), [warehouse]);
  const categoryMap = useMemo(() => mapBy(stockInCategory), [stockInCategory]);

// const filteredStockIns = useMemo(() => {
//   if (!stockIns) return [];

//   return stockIns
//     .map((stockIn) => {
//       // Handle itemId as array (convert to array if it's a string)
//       const itemIds = Array.isArray(stockIn.itemId) ? stockIn.itemId : [stockIn.itemId];

//       // Find matching stock records for the first item (or adjust as needed)
//       const stockRecord = itemStockRecord.find(
//         (record) => itemIds.includes(record.itemId)
//       );

//       const wh = warehouse.find((w) => w._id === stockIn.warehouseId);

//       return {
//         ...stockIn,
//         remainingStock: stockRecord?.remainingStock,
//         isWarehouseActive: wh?.isActive ?? true,
//         itemIds: itemIds, // Store as array for easier filtering
//       };
//     })
//     .filter((stockIn) => {
//       // Handle itemId as array
//       const itemIds = Array.isArray(stockIn.itemId) ? stockIn.itemId : [stockIn.itemId];

//       // Find related entities for the first item (or adjust logic as needed)
//       const firstItem = items.find((i) => i._id === itemIds[0]);
//       const partyObj = party.find((p) => p._id === stockIn.partyId);
//       const category = stockInCategory.find(
//         (c) => c._id === stockIn.stockInCategoryId
//       );

//       // Search filter
//       const searchTerm = (filters.search || "").toLowerCase();
//       const matchesSearch =
//         !searchTerm ||
//         stockIn.stockInId?.toString().toLowerCase().includes(searchTerm) ||
//         itemIds.some(id => {
//           const item = items.find(i => i._id === id);
//           return item?.itemName?.toLowerCase().includes(searchTerm);
//         }) ||
//         partyObj?.partyName?.toLowerCase().includes(searchTerm) ||
//         category?.stockInCategoryName?.toLowerCase().includes(searchTerm);

//       // Item filter - check if any item in the array matches the filter
//       const matchesItem =
//         !filters.itemId ||
//         (Array.isArray(filters.itemId)
//           ? filters.itemId.some(filterId => itemIds.includes(filterId))
//           : itemIds.includes(filters.itemId));

//       // Party filter
//       const matchesParty =
//         !filters.partyId || stockIn.partyId === filters.partyId;

//       // Category filter
//       const matchesCategory =
//         !filters.stockInCategoryId ||
//         stockIn.stockInCategoryId === filters.stockInCategoryId;

//       // Date filters
//       const stockInDate = stockIn.date ? new Date(stockIn.date) : null;
//       const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
//       const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

//       const matchesDateFrom =
//         !fromDate || !stockInDate || stockInDate >= fromDate;
//       const matchesDateTo = !toDate || !stockInDate || stockInDate <= toDate;

//       const matchesWarehouseStatus =
//         !filters.warehouseStatus ||
//         filters.warehouseStatus === "all" ||
//         (filters.warehouseStatus === "active" && stockIn.isWarehouseActive) ||
//         (filters.warehouseStatus === "inactive" && !stockIn.isWarehouseActive);

//       return (
//         matchesSearch &&
//         matchesItem &&
//         matchesParty &&
//         matchesCategory &&
//         matchesDateFrom &&
//         matchesWarehouseStatus &&
//         matchesDateTo
//       );
//     });
// }, [
//   stockIns,
//   filters.search,
//   filters.itemId,
//   filters.partyId,
//   filters.stockInCategoryId,
//   filters.dateFrom,
//   filters.dateTo,
//   filters.warehouseStatus,
//   items,
//   party,
//   stockInCategory,
//   itemStockRecord,
//   warehouse,
// ]);


const filteredStockIns = useMemo(() => {
  if (!stockIns) return [];

  return stockIns
    .map((stockIn) => {
      // Helper function to extract item information
      const extractItemInfo = (item: string | Item) => {
        if (typeof item === 'string') {
          const foundItem = items.find(i => i._id === item);
          return {
            id: item,
            name: foundItem?.itemName || 'Unknown Item',
            object: foundItem
          };
        } else {
          // item is of type Item
          return {
            id: (item as any)._id || (item as any).$oid || '',
            name: item.itemName || 'Unknown Item',
            object: item
          };
        }
      };

      // Handle itemId as array and ensure proper format
      let itemIds: string[] = [];
      let itemObjects: any[] = [];

      if (Array.isArray(stockIn.itemId)) {
        const itemInfo = stockIn.itemId.map(extractItemInfo);
        itemIds = itemInfo.map(info => info.id);
        itemObjects = itemInfo.map(info => info.object).filter(Boolean);
      } else if (stockIn.itemId) {
        const itemInfo = extractItemInfo(stockIn.itemId);
        itemIds = [itemInfo.id];
        itemObjects = itemInfo.object ? [itemInfo.object] : [];
      }

      // Find matching stock records for the first item
      const stockRecord = itemStockRecord.find(
        (record) => itemIds.includes(record.itemId)
      );

      const wh = warehouse.find((w) => w._id === stockIn.warehouseId);

      return {
        ...stockIn,
        itemId: itemObjects.length > 0 ? itemObjects : itemIds,
        remainingStock: stockRecord?.remainingStock,
        isWarehouseActive: wh?.isActive ?? true,
        itemIds: itemIds,
      };
    })
    .filter((stockIn) => {
      const itemIds = stockIn.itemIds || [];

      // Find related entities
      const partyObj = party.find((p) => p._id === stockIn.partyId);
      const category = stockInCategory.find(
        (c) => c._id === stockIn.stockInCategoryId
      );

      // Search filter
      const searchTerm = (filters.search || "").toLowerCase();
      const matchesSearch =
        !searchTerm ||
        stockIn.stockInId?.toString().toLowerCase().includes(searchTerm) ||
        itemIds.some(id => {
          const item = items.find(i => i._id === id);
          return item?.itemName?.toLowerCase().includes(searchTerm);
        }) ||
        partyObj?.partyName?.toLowerCase().includes(searchTerm) ||
        category?.stockInCategoryName?.toLowerCase().includes(searchTerm);

      // Fixed: Item filter with proper typing
      const matchesItem =
        !filters.itemId ||
        (Array.isArray(filters.itemId)
          ? filters.itemId.some((filterId: string) => itemIds.includes(filterId))
          : itemIds.includes(filters.itemId));

      // Party filter
      const matchesParty =
        !filters.partyId || stockIn.partyId === filters.partyId;

      // Category filter
      const matchesCategory =
        !filters.stockInCategoryId ||
        stockIn.stockInCategoryId === filters.stockInCategoryId;

      // Date filters
      const stockInDate = stockIn.date ? new Date(stockIn.date) : null;
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

      const matchesDateFrom =
        !fromDate || !stockInDate || stockInDate >= fromDate;
      const matchesDateTo = !toDate || !stockInDate || stockInDate <= toDate;

      const matchesWarehouseStatus =
        !filters.warehouseStatus ||
        filters.warehouseStatus === "all" ||
        (filters.warehouseStatus === "active" && stockIn.isWarehouseActive) ||
        (filters.warehouseStatus === "inactive" && !stockIn.isWarehouseActive);

      return (
        matchesSearch &&
        matchesItem &&
        matchesParty &&
        matchesCategory &&
        matchesDateFrom &&
        matchesWarehouseStatus &&
        matchesDateTo
      );
    });
}, [
  stockIns,
  filters.search,
  filters.itemId,
  filters.partyId,
  filters.stockInCategoryId,
  filters.dateFrom,
  filters.dateTo,
  filters.warehouseStatus,
  items,
  party,
  stockInCategory,
  itemStockRecord,
  warehouse,
]);
  const handleEdit = (stockIn: StockIn) => {
    navigate(`/stock-in-details/${stockIn._id}`);
  };

  const handleDelete = (stockIn: StockIn) => {
    setDeleteDialog({ open: true, stockIn, loading: false });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.stockIn) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      await deleteResource("/stock-ins", deleteDialog.stockIn._id as string);
      setStockIns((prev) =>
        prev.filter((item) => item._id !== deleteDialog.stockIn!._id)
      );
      showSnackbar("Stock-in record deleted successfully", "success");
    } catch (error) {
      console.error("Delete error:", error);
      showSnackbar(
        error instanceof Error
          ? error.message
          : "Failed to delete stock-in record",
        "error"
      );
    } finally {
      setDeleteDialog({ open: false, stockIn: null, loading: false });
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const clearFilters = () => {
    setFilters({});
  };

// const handleViewItems = (stockIn: StockIn) => {
//   // Ensure itemId is treated as an array
//   const itemIds = Array.isArray(stockIn.itemId)
//     ? stockIn.itemId
//     : [stockIn.itemId]; // Fallback if it's a string

//   setItemsDialog({
//     open: true,
//     itemIds: itemIds.map(id => id.toString()),
//     stockInId: stockIn.stockInId,
//   });
// };
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
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Stock-In</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Inbound inventory receipts
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search stock-ins…"
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
            onClick={() => navigate("/StockInFormPage")}
          >
            New stock-in
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <StockInFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        items={items}
        parties={party}
        stockInCategories={stockInCategory}
      />

      {/* Record list */}
      <StockInList
        records={filteredStockIns as any}
        itemMap={itemMap}
        partyMap={partyMap}
        warehouseMap={warehouseMap}
        categoryMap={categoryMap}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditItemDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, stockIn: null })}
        type="stockIn"
        item={editDialog.stockIn}
        onSuccess={loadAllData}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, stockIn: null, loading: false })
        }
        onConfirm={confirmDelete}
        isLoading={deleteDialog.loading}
        config={{
          title: "Delete Stock-In Record",
          description: `Are you sure you want to delete stock-in record #${deleteDialog.stockIn?.stockInId}?`,
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
