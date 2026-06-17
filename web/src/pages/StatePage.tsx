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
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from "react-router-dom";
import type { FilterStates, State, TableAction, TableColumn } from "../api/types";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { getResources, updateResource, deleteResource } from "../api/api";
import { DynamicTable } from "../components/common/table";
import { useAuth } from "../contexts/AuthContext";
import { StateImportExportButtons } from "../components/common/StateImportExportButtons";

export default function StatePage() {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterStates>({
    search: "",
    stateName: "",
    createdAt: "",
    updatedAt: "",
  });

  const [states, setStates] = useState<State[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: State | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: State | null;
    loading: boolean;
    deleteType?: 'soft' | 'hard'; // Add this
  }>({ open: false, item: null, loading: false });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const columns: TableColumn<State>[] = [
    { id: "stateName", label: "State Name" },
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

  const loadStates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources(`/states?showInactive=${showInactive}`);
      setStates(Array.isArray(response) ? response : []);
    } catch (err:any) {
      console.error("Error loading States:", err);
       showSnackbar(`Error: ${err.message}`, "error");
      setError(err instanceof Error ? err.message : "Failed to load States");
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStates();
  }, [showInactive]);

  const filteredItems = useMemo(() => {
    const safeItems = states || [];

    return safeItems.filter((item) => {
      const stateName = item.stateName || "";
      const createdAt = item.createdAt || "";

      const matchesSearch =
        !filters.search ||
        stateName.toLowerCase().includes(filters.search.toLowerCase()) ||
        createdAt.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCreatedAt =
        !filters.createdAt || item.createdAt === filters.createdAt;

      const matchesGroup =
        !filters.stateName || item.stateName === filters.stateName;

      return matchesSearch && matchesCreatedAt && matchesGroup;
    });
  }, [states, filters]);

  const handleEdit = (item: State) => {
    setEditDialog({ open: true, item });
  };

  // Delete handlers
  const handleSoftDelete = (item: State) => {
    setDeleteDialog({ 
      open: true, 
      item, 
      loading: false,
      deleteType: 'soft'
    });
  };

  const handleHardDelete = (item: State) => {
     if (!user || !['admin', 'manager'].includes(user.role)) {
      showSnackbar("You don't have permission to permanently delete states", "error");
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
        // Hard delete - permanent removal
        await deleteResource(
          "/states", 
          `${deleteDialog.item._id}/hard-delete`
        );
        
        setStates((prev: State[] | null) => {
          if (!prev) return [];
          return prev.filter((item) => item._id !== deleteDialog.item!._id);
        });

        showSnackbar("State permanently deleted successfully", "success");
      } else {
        // Soft delete - toggle active status
        const updatedState = await updateResource(
          "/states",
          deleteDialog.item._id as string,
          { isActive: !deleteDialog.item.isActive }
        );

        setStates((prev: State[] | null) => {
          if (!prev) return [];
          return prev.map((item) =>
            item._id === deleteDialog.item!._id
              ? { ...item, isActive: updatedState.isActive }
              : item
          );
        });

        showSnackbar(
          `State ${updatedState.isActive ? "enabled" : "disabled"} successfully`,
          "success"
        );
      }

      setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined });
    } catch (error) {
      console.error("Error deleting State:", error);
      showSnackbar(
        deleteDialog.deleteType === 'hard' 
          ? "Failed to delete State permanently" 
          : `Failed to ${deleteDialog.item?.isActive ? "disable" : "enable"} State`,
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
      stateName: "",
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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

  if (states === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No States available</Alert>
      </Box>
    );
  }

  const tableActions: TableAction<State>[] = [
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
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>States</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Manage your states
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search states…"
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
          <StateImportExportButtons
            items={filteredItems}
            onImportComplete={() => {
              loadStates(); // Refresh data after import
            }}
            isLoading={loading}
          />
          <Button
            variant="outlined"
            onClick={() => setShowInactive(!showInactive)}
            color={showInactive ? "primary" : "inherit"}
          >
            <span className="text-sm">{showInactive ? "Hide Inactive" : "Show Inactive"}</span>
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => navigate("/StateForm")}
          >
            New state
          </Button>
        </Box>
      </Box>

      {/* Filter Panel */}

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
        type="state"
        item={editDialog.item}
        onSuccess={loadStates}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined })}
        onConfirm={confirmDelete}
        isLoading={deleteDialog.loading}
        config={{
          title: deleteDialog.deleteType === 'hard' 
            ? "Permanently Delete State" 
            : deleteDialog.item?.isActive 
              ? "Disable State" 
              : "Enable State",
          description: deleteDialog.deleteType === 'hard'
            ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
            : deleteDialog.item?.isActive
              ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
              : "Are you sure you want to enable {itemName}?",
          variables: { itemName: deleteDialog.item?.stateName || "" },
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}