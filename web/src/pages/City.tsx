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
import type { State,  City, TableColumn, FilterCity, TableAction } from "../api/types";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources, updateResource } from "../api/api";
import { DynamicTable } from "../components/common/table";
import { useAuth } from "../contexts/AuthContext";
import { CityImportExportButtons } from "../components/common/CityImportExportButtons";

export default function CityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [city, setCity] = useState<City[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterCity>({
    search: "",
    stateId: "",
    cityName: "",
    createdAt: "",
  });

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: City | null;
  }>({ open: false, item: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: City | null;
    loading: boolean;
    deleteType?: 'soft' | 'hard';
  }>({ open: false, item: null, loading: false });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Load City with populated city data
  const loadCity = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources(`/cities?showInactive=${showInactive}&populate=true`);
      setCity(Array.isArray(response) ? response : []);
    } catch (err:any) {
      console.error("Error loading City:", err);
      showSnackbar(`Error: ${err.message}`, "error");
      setError(err instanceof Error ? err.message : "Failed to load City");
      setCity([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCity();
  }, [showInactive]);

  const columns: TableColumn<City>[] = [
    { id: "cityName", label: "City Name" },
    {
      id: "stateId",
      label: "State Name",
      format: (value, row) => {
        if (!value || typeof value !== 'object') {
          return "No State Assigned";
        }
        
        return (
          <Box display="flex" alignItems="center" gap={1}>
            {value.stateName || "Unknown State"}
            {value.isActive === false && (
              <Chip label="Inactive" size="small" color="error" variant="outlined" />
            )}
          </Box>
        );
      },
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

  // Filtering logic - updated to use populated state data
  const filteredItems = useMemo(() => {
    return city.filter((item) => {
      const cityName = item.cityName || "";
      const state = item.stateId as State;
      const stateName = state?.stateName || "";
      const createdAt = item.createdAt || "";

      const matchesSearch =
        !filters.search ||
        stateName.toLowerCase().includes(filters.search.toLowerCase()) ||
        cityName.toLowerCase().includes(filters.search.toLowerCase()) ||
        createdAt.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCityName = !filters.cityName || item.cityName === filters.cityName;
      const matchesStateId = !filters.stateId || (state && state._id === filters.stateId);
      const matchesCreatedAt = !filters.createdAt || item.createdAt === filters.createdAt;

      return matchesSearch && matchesCityName && matchesStateId && matchesCreatedAt;
    });
  }, [city, filters]);

  const handleEdit = (item: City) => {
    setEditDialog({ open: true, item });
  };

  // Delete handlers
  const handleSoftDelete = (item: City) => {
    setDeleteDialog({
      open: true,
      item,
      loading: false,
      deleteType: 'soft'
    });
  };

  const handleHardDelete = (item: City) => {
    if (!user || !['admin', 'manager'].includes(user.role)) {
      showSnackbar("You don't have permission to permanently delete cities", "error");
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
          "/cities", 
          `${deleteDialog.item._id}/hard-delete`
        );
        
        setCity((prev: City[] | null) => {
          if (!prev) return [];
          return prev.filter((item) => item._id !== deleteDialog.item!._id);
        });

        showSnackbar("City permanently deleted successfully", "success");
      } else {
        // Soft delete - toggle active status
        const updated = await updateResource(
          "/cities", 
          deleteDialog.item._id as string,
          { isActive: !deleteDialog.item.isActive }
        );

        setCity((prev) =>
          prev.map((i) => (i._id === deleteDialog.item!._id ? { ...i, isActive: updated.isActive } : i))
        );

        showSnackbar(
          `City ${updated.isActive ? "enabled" : "disabled"} successfully`,
          "success"
        );
      }

      setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined });
    } catch (error) {
      console.error("Error deleting city:", error);
      showSnackbar(
        deleteDialog.deleteType === 'hard' 
          ? "Failed to delete city permanently" 
          : `Failed to ${deleteDialog.item?.isActive ? "disable" : "enable"} city`,
        "error"
      );
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const clearFilters = () => {
    setFilters({
      search: "",
      cityName: "",
      stateId: "",
      createdAt: "",
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

  const tableActions: TableAction<City>[] = [
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
  } // ✅ YEH CLOSING BRACKET MISSING THI

  return (
    <Box className="flex flex-col">
      {/* Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end", justifyContent: "space-between", mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "stretch", gap: 1.5 }}>
          <Box sx={{ width: "3px", borderRadius: "2px", bgcolor: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Cities</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Manage your cities and their associated state
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search cities…"
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
          <CityImportExportButtons
            items={filteredItems}
            onImportComplete={() => {
              loadCity(); // Refresh data after import
            }}
            isLoading={loading}
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
            onClick={() => navigate("/CityForm")}
          >
            New city
          </Button>
        </Box>
      </Box>

      {/* Filters */}

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
        type="city"
        item={editDialog.item}
        onSuccess={loadCity}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined })}
        onConfirm={confirmDelete}
        isLoading={deleteDialog.loading}
        config={{
          title: deleteDialog.deleteType === 'hard' 
            ? "Permanently Delete City" 
            : deleteDialog.item?.isActive 
              ? "Disable City" 
              : "Enable City",
          description: deleteDialog.deleteType === 'hard'
            ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
            : deleteDialog.item?.isActive
              ? "Are you sure you want to disable {itemName}? You can enable it later."
              : "Are you sure you want to enable {itemName}?",
          variables: { itemName: deleteDialog.item?.cityName || "" },
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