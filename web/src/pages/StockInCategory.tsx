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
import { Edit, Plus, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type {
  FilterStockInCategory,
  StockInCategory,
  TableAction,
  TableColumn,
} from "../api/types";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources, updateResource } from "../api/api";
import { DynamicTable } from "../components/common/table";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from "../contexts/AuthContext";

export default function StockInCategoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterStockInCategory>({
    search: "",
    stockInCategoryName: "",
    createdAt: "",
  });

  const [stockInCategory, setStockInCategory] = useState<StockInCategory[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: StockInCategory | null;
  }>({ open: false, item: null });
 const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: StockInCategory | null;
    loading: boolean;
    deleteType: 'soft' | 'hard'; // Track delete type
  }>({ open: false, item: null, loading: false, deleteType: 'soft' });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const columns: TableColumn<StockInCategory>[] = [
    {
      id: "stockInCategoryName",
      label: "Stock In Category Name",
    },
    {
      id: "status",
      label: "Status",
      format: (_value, row) => (
        <Chip
          label={row.isActive ? "Active" : "Inactive"}
          color={row.isActive ? "success" : "error"}
          size="small"
        />
      ),
    },
    { id: "description", label: "Description", minWidth: 150 },
    {
      id: "updatedAt",
      label: "Updated At",
      format: (value) => new Date(value).toLocaleDateString('en-GB'),
    },
    {
      id: "createdAt",
      label: "Created At",
      format: (value) => new Date(value).toLocaleDateString('en-GB'),
    },
  ];

  const loadStockInCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources(
        `/stock-in-categories?showInactive=${showInactive}`
      );
      setStockInCategory(Array.isArray(response) ? response : []);
    } catch (err:any) {
      console.error("Error loading Stock in Categories:", err);
       showSnackbar(`Error: ${err.message}`, "error");
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load Stock in Categories"
      );
      setStockInCategory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockInCategory();
  }, [showInactive]);

  const filteredItems = useMemo(() => {
    // Safely handle null/undefined items
    const safeItems = stockInCategory || [];

    return safeItems.filter((item) => {
      // Safely handle potentially undefined values
      const stockInCategoryName = item.stockInCategoryName || "";
      const createdAt = item.createdAt || "";

      const matchesSearch =
        !filters.search ||
        stockInCategoryName
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        createdAt.toLowerCase().includes(filters.search.toLowerCase());

      return matchesSearch;
    });
  }, [stockInCategory, filters]);

  const handleEdit = (item: StockInCategory) => {
    setEditDialog({ open: true, item });
  };

  // const handleDelete = (item: StockInCategory) => {
  //   setDeleteDialog({ open: true, item, loading: false });
  // };

  // const confirmDelete = async () => {
  //   if (!deleteDialog.item) return;

  //   setDeleteDialog((prev) => ({ ...prev, loading: true }));

  //   try {
  //     const updatedStockInCategory = await updateResource(
  //       "/stock-in-categories",
  //       deleteDialog.item._id as string,
  //       { isActive: !deleteDialog.item.isActive }
  //     );

  //     setStockInCategory((prev: StockInCategory[] | null) => {
  //       if (!prev) return [];
  //       return prev.map((item) =>
  //         item._id === deleteDialog.item!._id
  //           ? { ...item, isActive: updatedStockInCategory.isActive }
  //           : item
  //       );
  //     });

  //     showSnackbar(
  //       `Stock in category ${
  //         updatedStockInCategory.isActive ? "enabled" : "disabled"
  //       } successfully`,
  //       "success"
  //     );
  //     setDeleteDialog({ open: false, item: null, loading: false });
  //   } catch (error) {
  //     console.error("Error toggling stock in category status:", error);
  //     showSnackbar(
  //       `Failed to ${
  //         deleteDialog.item.isActive ? "disable" : "enable"
  //       } stock in category`,
  //       "error"
  //     );
  //     setDeleteDialog((prev) => ({ ...prev, loading: false }));
  //   }
  // };

    // Soft Delete - Toggle stock in category status
  const handleSoftDelete = (item: StockInCategory) => {
    setDeleteDialog({ 
      open: true, 
      item, 
      loading: false, 
      deleteType: 'soft' 
    });
  };

  // Hard Delete - Permanent deletion
  const handleHardDelete = (item: StockInCategory) => {
    if (!user || !['admin', 'manager'].includes(user.role)) {
      showSnackbar("You don't have permission to permanently delete stock in categories", "error");
      return;
    }
    setDeleteDialog({ 
      open: true, 
      item, 
      loading: false, 
      deleteType: 'hard' 
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.item) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      if (deleteDialog.deleteType === 'hard') {
        // Hard Delete - Permanent removal
        await deleteResource("/stock-in-categories", `${deleteDialog.item._id}/hard-delete`);

        // Remove from local state
        setStockInCategory((prev: StockInCategory[] | null) => {
          if (!prev) return [];
          return prev.filter((item) => item._id !== deleteDialog.item!._id);
        });

        showSnackbar("Stock in category permanently deleted successfully", "success");
      } else {
        // Soft Delete - Toggle active status
        const updatedStockInCategory = await updateResource(
          "/stock-in-categories",
          deleteDialog.item._id as string,
          { isActive: !deleteDialog.item.isActive }
        );

        // Update local state
        setStockInCategory((prev: StockInCategory[] | null) => {
          if (!prev) return [];
          return prev.map((item) =>
            item._id === deleteDialog.item!._id
              ? { ...item, isActive: updatedStockInCategory.isActive }
              : item
          );
        });

        showSnackbar(
          `Stock in category ${
            updatedStockInCategory.isActive ? "enabled" : "disabled"
          } successfully`,
          "success"
        );
      }

      setDeleteDialog({ open: false, item: null, loading: false, deleteType: 'soft' });
    } catch (error: any) {
      console.error("Error deleting stock in category:", error);
      
      let errorMessage = "Failed to delete stock in category";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (deleteDialog.deleteType === 'hard') {
        errorMessage = "Failed to permanently delete stock in category";
      } else {
        errorMessage = `Failed to ${deleteDialog.item?.isActive ? "disable" : "enable"} stock in category`;
      }

      showSnackbar(errorMessage, "error");
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
      createdAt: "",
      stockInCategoryName: "",
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
  // Additional safety check
  if (stockInCategory === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No items data available</Alert>
      </Box>
    );
  }

  const tableActions: TableAction<StockInCategory>[] = [
    { 
      icon: <Edit size={16} />, 
      tooltip: "Edit city", 
      color: "primary", 
      onClick: handleEdit 
    },
    {
      icon: <VisibilityOffIcon sx={{ fontSize: 16 }} />,
      tooltip: "Toggle City Status",
      color: "warning",
      onClick: handleSoftDelete,
    },
  ];

  // ✅ YEH LINE ADD KARNA THA - if statement ke liye closing bracket
  if (user && ['admin', 'manager'].includes(user.role)) {
    tableActions.push({
      icon: <Trash2 size={16} />,
      tooltip: "Delete city",
      color: "error",
      onClick: handleHardDelete,
    });
  }

  return (
    <Box className="flex flex-col">
      {/* Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end", justifyContent: "space-between", mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "stretch", gap: 1.5 }}>
          <Box sx={{ width: "3px", borderRadius: "2px", bgcolor: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Stock In Categories</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Categorize inbound inventory movements
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search categories…"
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            sx={{ width: { xs: "100%", sm: 240 } }}
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
          >
            <span className="text-[0.875rem]">
              {showInactive ? "Hide Inactive" : "Show Inactive"}
            </span>
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => navigate("/StockInCategoryFormPage")}
          >
            New category
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <DynamicTable
        serialColumn
        data={filteredItems || []}
        columns={columns}
        actions={tableActions}
      />

      {/* Edit Dialog */}
      <EditItemDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, item: null })}
        type="stockInCategory"
        item={editDialog.item}
        onSuccess={loadStockInCategory}
      />

      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, item: null, loading: false, deleteType: 'soft' })
        }
        onConfirm={confirmDelete}
        isLoading={deleteDialog.loading}
        config={{
          title: deleteDialog.deleteType === 'hard' 
            ? "Permanently Delete Stock In Category" 
            : deleteDialog.item?.isActive ? "Disable Stock In Category" : "Enable Stock In Category",
          description: deleteDialog.deleteType === 'hard'
            ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and all associated data will be lost."
            : deleteDialog.item?.isActive
              ? "Are you sure you want to disable {itemName}? This category will not be available for stock entries until enabled again."
              : "Are you sure you want to enable {itemName}? This category will become available for stock entries.",
          variables: { itemName: deleteDialog.item?.stockInCategoryName || "" },
          confirmText: deleteDialog.deleteType === 'hard' 
            ? "Delete Permanently" 
            : deleteDialog.item?.isActive ? "Disable" : "Enable",
          loadingText: deleteDialog.deleteType === 'hard'
            ? "Deleting..."
            : deleteDialog.item?.isActive ? "Disabling..." : "Enabling...",
        }}
        severity={deleteDialog.deleteType === 'hard' || (deleteDialog.deleteType === 'soft' && deleteDialog.item?.isActive) ? "error" : "success"}
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
