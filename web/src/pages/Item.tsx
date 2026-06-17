import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  Button,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type {
  FilterState,
  Item,
  ItemGroup,
  ItemStockRecord,
} from "../api/types";
import { FilterPanel } from "../components/filter/ItemFilterPanel";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources, updateResource } from "../api/api";
import { ItemList } from "../components/common/ItemList";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from "../contexts/AuthContext";
export default function ItemPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mergedItems, setMergedItems] = useState<Item[]>([]);
  const [stockRecords, setStockRecords] = useState<ItemStockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    requiresInstallation: "",
    requiresSerialNumberManagement: "",
    itemGroupName: "",
  });
  const [itemsGroups, setItemsGroups] = useState<ItemGroup[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: Item | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: Item | null;
    loading: boolean;
    deleteType?: 'soft' | 'hard'; // Add this
  }>({ open: false, item: null, loading: false });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [itemsResponse, stockRecordsResponse, groupsResponse] =
        await Promise.all([
          getResources(`/items?showInactive=${showInactive}`),
          getResources("/item-stock-records"),
          getResources("/item-groups?showInactive=true"),
        ]);

      const items = Array.isArray(itemsResponse) ? itemsResponse : [];
      const stockRecords = Array.isArray(stockRecordsResponse)
        ? stockRecordsResponse
        : [];
      const groups = Array.isArray(groupsResponse) ? groupsResponse : [];

      // Merge data
      const merged = items.map((item) => {
        const stockData = stockRecords.find(
          (record) => record.itemId === item._id
        );
        return {
          ...item,
          openingStock: stockData?.openingStock ?? 0,
          remainingStock: stockData?.remainingStock ?? 0,
        };
      });

      setMergedItems(merged);
      setItemsGroups(groups);
    } catch (err:any) {
      console.error("Error loading data:", err);
       showSnackbar(`Error: ${err.message}`, "error");
      setError(err instanceof Error ? err.message : "Failed to load data");
      setMergedItems([]);
      setItemsGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [showInactive]);


  const filteredItems = useMemo(() => {
    return mergedItems.filter((item) => {
      const matchesSearch =
        !filters.search ||
        item.itemName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.modelNoSKU?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesGroup =
        !filters.itemGroupName || item.itemGroupId === filters.itemGroupName;

      return matchesSearch && matchesGroup;
    });
  }, [mergedItems, filters]);

  // ---- lookup map for item-group name resolution in the card list ----
  const itemGroupMap = useMemo(
    () => new Map(itemsGroups.map((g) => [g._id, g])),
    [itemsGroups]
  );

  const handleEdit = (item: Item) => {
    const stockData = stockRecords.find(
      (record: ItemStockRecord) => record.itemId === item._id
    );

    setEditDialog({
      open: true,
      item: {
        ...item,
        openingStock: stockData?.openingStock || 0,
        remainingStock: stockData?.remainingStock || 0,
        closingStock: stockData?.closingStock || 0,
      },
    });
  };

  // const handleDelete = (item: Item) => {
  //   setDeleteDialog({ open: true, item, loading: false });
  // };


const handleSoftDelete = (item: Item) => {
  setDeleteDialog({ 
    open: true, 
    item, 
    loading: false,
    deleteType: 'soft' // Add this to track delete type
  });
};

const handleHardDelete = (item: Item) => {
     if (!user || !['admin', 'manager'].includes(user.role)) {
      showSnackbar("You don't have permission to permanently delete items", "error");
      return;
    }
  setDeleteDialog({ 
    open: true, 
    item, 
    loading: false,
    deleteType: 'hard' // Add this to track delete type
  });
};

  // const confirmDelete = async () => {
  //   if (!deleteDialog.item) return;

  //   setDeleteDialog((prev) => ({ ...prev, loading: true }));

  //   try {
  //     const updatedItem = await updateResource(
  //       "/items",
  //       deleteDialog.item._id as string,
  //       { isActive: !deleteDialog.item.isActive }
  //     );

  //     setMergedItems((prev: Item[] | null) => {
  //       if (!prev) return [];
  //       return prev.map((item) =>
  //         item._id === deleteDialog.item!._id
  //           ? { ...item, isActive: updatedItem.isActive }
  //           : item
  //       );
  //     });

  //     showSnackbar(
  //       `Item ${updatedItem.isActive ? "enabled" : "disabled"} successfully`,
  //       "success"
  //     );
  //     setDeleteDialog({ open: false, item: null, loading: false });
  //   } catch (error) {
  //     console.error("Error toggling item status:", error);
  //     showSnackbar(
  //       `Failed to ${deleteDialog.item.isActive ? "disable" : "enable"} item`,
  //       "error"
  //     );
  //     setDeleteDialog((prev) => ({ ...prev, loading: false }));
  //   }
  // };


  const confirmDelete = async () => {
  if (!deleteDialog.item) return;

  setDeleteDialog((prev) => ({ ...prev, loading: true }));

  try {
    if (deleteDialog.deleteType === 'hard') {
      // Hard delete - permanent removal
      await deleteResource("/items", `${deleteDialog.item._id}/hard-delete`);
      
      setMergedItems((prev: Item[] | null) => {
        if (!prev) return [];
        return prev.filter((item) => item._id !== deleteDialog.item!._id);
      });

      showSnackbar("Item permanently deleted successfully", "success");
    } else {
      // Soft delete - toggle active status (existing logic)
      const updatedItem = await updateResource(
        "/items",
        deleteDialog.item._id as string,
        { isActive: !deleteDialog.item.isActive }
      );

      setMergedItems((prev: Item[] | null) => {
        if (!prev) return [];
        return prev.map((item) =>
          item._id === deleteDialog.item!._id
            ? { ...item, isActive: updatedItem.isActive }
            : item
        );
      });

      showSnackbar(
        `Item ${updatedItem.isActive ? "enabled" : "disabled"} successfully`,
        "success"
      );
    }

    setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined });
  } catch (error) {
    console.error("Error deleting item:", error);
    showSnackbar(
      deleteDialog.deleteType === 'hard' 
        ? "Failed to delete item permanently" 
        : `Failed to ${deleteDialog.item?.isActive ? "disable" : "enable"} item`,
      "error"
    );
    setDeleteDialog((prev) => ({ ...prev, loading: false }));
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
      requiresInstallation: "",
      requiresSerialNumberManagement: "",
      itemGroupName: "",
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
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Items</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Manage your inventory items and stock levels
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search items…"
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
            variant="outlined"
            onClick={() => setShowInactive(!showInactive)}
            color={showInactive ? "primary" : "inherit"}
            className="transition-all duration-900 ease-in-out"
          >
            <span className="text-[0.875rem]">
              {showInactive ? "Hide Inactive" : "Show Inactive"}
            </span>
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => navigate("/ItemFormPage")}
          >
            New item
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />


 

      {/* Record list */}
      <ItemList
        records={filteredItems}
        itemGroupMap={itemGroupMap}
        onEdit={handleEdit}
        onDelete={handleSoftDelete}
      />

      {/* Edit Dialog */}
      <EditItemDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, item: null })}
        type="item"
        item={editDialog.item}
        onSuccess={loadData}
      />

    <ConfirmationDialog
      open={deleteDialog.open}
      onClose={() =>
        setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined })
      }
      onConfirm={confirmDelete}
      isLoading={deleteDialog.loading}
      config={{
        title: deleteDialog.deleteType === 'hard' 
          ? "Permanently Delete Item" 
          : deleteDialog.item?.isActive ? "Disable Item" : "Enable Item",
        description: deleteDialog.deleteType === 'hard'
          ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
          : deleteDialog.item?.isActive
            ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
            : "Are you sure you want to enable {itemName}?",
        variables: { itemName: deleteDialog.item?.itemName || "" },
        confirmText: deleteDialog.deleteType === 'hard' 
          ? "Delete Permanently" 
          : deleteDialog.item?.isActive ? "Disable" : "Enable",
        loadingText: deleteDialog.deleteType === 'hard'
          ? "Deleting..."
          : deleteDialog.item?.isActive ? "Disabling..." : "Enabling...",
      }}
      severity={deleteDialog.deleteType === 'hard' || deleteDialog.item?.isActive ? "error" : "success"}
      actionVariant={deleteDialog.deleteType === 'hard' ? "delete" : "update"}
    />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
