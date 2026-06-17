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
  FilterLogisticsProviderCategory,
  LogisticsProviderCategory,
  TableAction,
  TableColumn,
} from "../api/types";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources, updateResource } from "../api/api";
import { DynamicTable } from "../components/common/table";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../contexts/AuthContext";

export default function LogisticsProviderCategoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterLogisticsProviderCategory>({
    search: "",
    logisticsProviderCategoryName: "",
    logisticsProviderCategoryId: 0,
    updatedAt: "",
    createdAt: "",
  });

  const [logisticsProviderCategory, setLogisticsProviderCategory] = useState<
    LogisticsProviderCategory[]
  >([]);
  const [showInactive, setShowInactive] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: LogisticsProviderCategory | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: LogisticsProviderCategory | null;
    loading: boolean;
    deleteType?: "soft" | "hard"; // Add this
  }>({ open: false, item: null, loading: false });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const columns: TableColumn<LogisticsProviderCategory>[] = [
    { id: "logisticsProviderCategoryName", label: "Name" },
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
    {
      id: "updatedAt",
      label: "Updated At",
      format: (value) => new Date(value).toLocaleDateString("en-GB"),
    },
    {
      id: "createdAt",
      label: "Created At",
      format: (value) => new Date(value).toLocaleDateString("en-GB"),
    },
  ];

  const loadLogisticsProviderCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources(
        `/logistics-provider-categories?showInactive=${showInactive}`
      );
      setLogisticsProviderCategory(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error("Error loading Logistics Provider Category:", err);
      showSnackbar(`Error: ${err.message}`, "error");
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load Logistics Provider Category"
      );
      setLogisticsProviderCategory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogisticsProviderCategory();
  }, [showInactive]);

  const filteredItems = useMemo(() => {
    // Safely handle null/undefined items
    const safeItems = logisticsProviderCategory || [];

    return safeItems.filter((item) => {
      // Safely handle potentially undefined values
      const logisticsProviderCategoryName =
        item.logisticsProviderCategoryName || "";
      const logisticsProviderCategoryId = item.logisticsProviderCategoryId || 0;
      const updatedAt = item.updatedAt || "";
      const createdAt = item.createdAt || "";

      const matchesSearch =
        !filters.search ||
        logisticsProviderCategoryName
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        String(logisticsProviderCategoryId).includes(filters.search) ||
        updatedAt.toLowerCase().includes(filters.search.toLowerCase()) ||
        createdAt.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCreatedAt =
        !filters.createdAt || item.createdAt === filters.createdAt;

      const matchesLogisticsProviderCategoryName =
        !filters.logisticsProviderCategoryName ||
        item.logisticsProviderCategoryName ===
          filters.logisticsProviderCategoryName;

      const matchesLogisticsProviderCategoryId =
        !filters.logisticsProviderCategoryId ||
        item.logisticsProviderCategoryId ===
          filters.logisticsProviderCategoryId;

      const matchesGroup =
        matchesLogisticsProviderCategoryName &&
        matchesLogisticsProviderCategoryId;

      return matchesSearch && matchesCreatedAt && matchesGroup;
    });
  }, [logisticsProviderCategory, filters]);

  const handleEdit = (item: LogisticsProviderCategory) => {
    setEditDialog({ open: true, item });
  };

  // const handleDelete = (item: LogisticsProviderCategory) => {
  //   setDeleteDialog({ open: true, item, loading: false });
  // };

  // const confirmDelete = async () => {
  //   if (!deleteDialog.item) return;

  //   setDeleteDialog((prev) => ({ ...prev, loading: true }));

  //   try {
  //     const updatedLogisticsProviderCategory = await updateResource(
  //       "/logistics-provider-categories",
  //       deleteDialog.item._id as string,
  //       { isActive: !deleteDialog.item.isActive }
  //     );

  //     setLogisticsProviderCategory(
  //       (prev: LogisticsProviderCategory[] | null) => {
  //         if (!prev) return [];
  //         return prev.map((item) =>
  //           item._id === deleteDialog.item!._id
  //             ? { ...item, isActive: updatedLogisticsProviderCategory.isActive }
  //             : item
  //         );
  //       }
  //     );

  //     showSnackbar(
  //       `Logistics Provider Category ${
  //         updatedLogisticsProviderCategory.isActive ? "enabled" : "disabled"
  //       } successfully`,
  //       "success"
  //     );
  //     setDeleteDialog({ open: false, item: null, loading: false });
  //   } catch (error) {
  //     console.error(
  //       "Error toggling Logistics Provider Category status:",
  //       error
  //     );
  //     showSnackbar(
  //       `Failed to ${
  //         deleteDialog.item.isActive ? "disable" : "enable"
  //       } Logistics Provider Category`,
  //       "error"
  //     );
  //     setDeleteDialog((prev) => ({ ...prev, loading: false }));
  //   }
  // };

  // Replace the handleDelete function with these two functions:
  const handleSoftDelete = (item: LogisticsProviderCategory) => {
    setDeleteDialog({
      open: true,
      item,
      loading: false,
      deleteType: "soft",
    });
  };

  const handleHardDelete = (item: LogisticsProviderCategory) => {
    
    if (!user || !['admin', 'manager'].includes(user.role)) {
      showSnackbar("You don't have permission to permanently delete Logistics Provider Category", "error");
      return;
    }
    setDeleteDialog({
      open: true,
      item,
      loading: false,
      deleteType: "hard",
    });
  };

  // Update the confirmDelete function:
  const confirmDelete = async () => {
    if (!deleteDialog.item) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      if (deleteDialog.deleteType === "hard") {
        // Hard delete - permanent removal
        await deleteResource(
          "/logistics-provider-categories",
          `${deleteDialog.item._id}/hard-delete`
        );

        setLogisticsProviderCategory(
          (prev: LogisticsProviderCategory[] | null) => {
            if (!prev) return [];
            return prev.filter((item) => item._id !== deleteDialog.item!._id);
          }
        );

        showSnackbar(
          "Logistics Provider Category permanently deleted successfully",
          "success"
        );
      } else {
        // Soft delete - toggle active status
        const updatedLogisticsProviderCategory = await updateResource(
          "/logistics-provider-categories",
          deleteDialog.item._id as string,
          { isActive: !deleteDialog.item.isActive }
        );

        setLogisticsProviderCategory(
          (prev: LogisticsProviderCategory[] | null) => {
            if (!prev) return [];
            return prev.map((item) =>
              item._id === deleteDialog.item!._id
                ? {
                    ...item,
                    isActive: updatedLogisticsProviderCategory.isActive,
                  }
                : item
            );
          }
        );

        showSnackbar(
          `Logistics Provider Category ${
            updatedLogisticsProviderCategory.isActive ? "enabled" : "disabled"
          } successfully`,
          "success"
        );
      }

      setDeleteDialog({
        open: false,
        item: null,
        loading: false,
        deleteType: undefined,
      });
    } catch (error) {
      console.error("Error deleting Logistics Provider Category:", error);
      showSnackbar(
        deleteDialog.deleteType === "hard"
          ? "Failed to delete Logistics Provider Category permanently"
          : `Failed to ${
              deleteDialog.item?.isActive ? "disable" : "enable"
            } Logistics Provider Category`,
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
      createdAt: "",
      logisticsProviderCategoryName: "",
      logisticsProviderCategoryId: 0,
      updatedAt: "",
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
  if (logisticsProviderCategory === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No Logistics Category available</Alert>
      </Box>
    );
  }

  
const tableActions: TableAction<LogisticsProviderCategory>[] = [
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
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Logistics Providers</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Manage logistics provider categories
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search providers…"
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
            onClick={() => navigate("/LogisticsProviderCategoryForm")}
          >
            New provider
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
        type="logisticsProviderCategory"
        item={editDialog.item}
        onSuccess={loadLogisticsProviderCategory}
      />

      {/* Delete Confirmation Dialog */}
      {/* <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null, loading: false })}
        onConfirm={confirmDelete}
        itemName={deleteDialog.item?.itemGroupName || ""}
        isLoading={deleteDialog.loading}
      /> */}

      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({
            open: false,
            item: null,
            loading: false,
            deleteType: undefined,
          })
        }
        onConfirm={confirmDelete}
        isLoading={deleteDialog.loading}
        config={{
          title:
            deleteDialog.deleteType === "hard"
              ? "Permanently Delete Logistics Provider Category"
              : deleteDialog.item?.isActive
              ? "Disable Logistics Provider Category"
              : "Enable Logistics Provider Category",
          description:
            deleteDialog.deleteType === "hard"
              ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
              : deleteDialog.item?.isActive
              ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
              : "Are you sure you want to enable {itemName}?",
          variables: {
            itemName: deleteDialog.item?.logisticsProviderCategoryName || "",
          },
          confirmText:
            deleteDialog.deleteType === "hard"
              ? "Delete Permanently"
              : deleteDialog.item?.isActive
              ? "Disable"
              : "Enable",
          loadingText:
            deleteDialog.deleteType === "hard"
              ? "Deleting..."
              : deleteDialog.item?.isActive
              ? "Disabling..."
              : "Enabling...",
        }}
        severity={
          deleteDialog.deleteType === "hard" || deleteDialog.item?.isActive
            ? "error"
            : "success"
        }
        actionVariant={deleteDialog.deleteType === "hard" ? "delete" : "update"}
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
