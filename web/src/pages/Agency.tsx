import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  Button,
  Chip,
} from "@mui/material";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { TextField, InputAdornment } from "@mui/material";
import type {
  Agency,
  FilterAgency,
  TableAction,
  TableColumn,
} from "../api/types";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources, updateResource } from "../api/api";
import { DynamicTable } from "../components/common/table";
import { useNavigate } from "react-router-dom";
import { AgencyImportExportButtons } from "../components/common/AgencyImportExportButtons";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from "../contexts/AuthContext";


export default function AgencyPage() {
  const navigate = useNavigate();
    const { user } = useAuth();
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterAgency>({
    search: "",
    agencyName: "",
    agencyNumber: "",
    cityId: "",
    stateId: "",
    updatedAt: "",
    createdAt: "",
  });

  const [agency, setAgency] = useState<Agency[]>([]);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: Agency | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: Agency | null;
    loading: boolean;
    deleteType?: 'soft' | 'hard'; // Add this
  }>({ open: false, item: null, loading: false });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

// In the columns array, add these columns:
const columns: TableColumn<Agency>[] = [
  { id: "agencyName", label: "Agency Name" },
  { id: "agencyNumber", label: "Agency Number" },
  {
    id: "cityId",
    label: "City",
    format: (_value, row) => (
      <span>
        {typeof row.cityId === 'object' && row.cityId !== null 
          ? (row.cityId as any).cityName 
          : "N/A"}
      </span>
    ),
  },
  {
    id: "stateId",
    label: "State",
    format: (_value, row) => (
      <span>
        {typeof row.stateId === 'object' && row.stateId !== null 
          ? (row.stateId as any).stateName 
          : "N/A"}
      </span>
    ),
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
    format: (value) => new Date(value).toLocaleDateString('en-GB'),
  },
  {
    id: "createdAt",
    label: "Created At",
    format: (value) => new Date(value).toLocaleDateString('en-GB'),
  },
];
  const loadAgency = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources(
        `/agency?showInactive=${showInactive}&populate=true`
      );
      setAgency(Array.isArray(response) ? response : []);
    } catch (err:any) {
       showSnackbar(`Error: ${err.message}`, "error");
      console.error("Error loading Agency:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load Agency"
      );
      setAgency([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgency();
  }, [showInactive]);

  const filteredItems = useMemo(() => {
    // Safely handle null/undefined items
    const safeItems = agency || [];

    return safeItems.filter((item) => {
      // Safely handle potentially undefined values
      const agencyName = item.agencyName || "";
        const agencyNumber = item.agencyNumber || "";
      const updatedAt = item.updatedAt || "";
      const createdAt = item.createdAt || "";

      const matchesSearch =
        !filters.search ||
        agencyName
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        agencyNumber
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        updatedAt.toLowerCase().includes(filters.search.toLowerCase()) ||
        createdAt.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCreatedAt =
        !filters.createdAt || item.createdAt === filters.createdAt;

      const matchesUpdatedAt =
        !filters.updatedAt || item.updatedAt === filters.updatedAt;

      const matchesAgency =
        !filters.agencyName ||
        item.agencyName === filters.agencyName;
        const matchesAgencyNumber =
        !filters.agencyNumber ||
        item.agencyNumber === filters.agencyNumber;

      return (
        matchesSearch &&
        matchesCreatedAt &&
        matchesAgencyNumber &&
        matchesAgency &&
        matchesUpdatedAt
      );
    });
  }, [agency, filters]);

  // Edit handlers
  const handleEdit = (item: Agency) => {
    setEditDialog({ open: true, item });
  };


    // Soft Delete handler
  const handleSoftDelete = (item: Agency) => {
    setDeleteDialog({ 
      open: true, 
      item, 
      loading: false,
      deleteType: 'soft'
    });
  };

  // Hard Delete handler
  const handleHardDelete = (item: Agency) => {
    if (!user || !['admin', 'manager'].includes(user.role)) {
      showSnackbar("You don't have permission to permanently delete Agencies", "error");
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
        await deleteResource("/agency", `${deleteDialog.item._id}/hard-delete`);
        
        setAgency((prev: Agency[] | null) => {
          if (!prev) return [];
          return prev.filter((item) => item._id !== deleteDialog.item!._id);
        });

        showSnackbar("Agency permanently deleted successfully", "success");
      } else {
        // Soft delete - toggle active status
        const updatedAgency = await updateResource(
          "/agency",
          deleteDialog.item._id as string,
          { isActive: !deleteDialog.item.isActive }
        );

        setAgency((prev: Agency[] | null) => {
          if (!prev) return [];
          return prev.map((item) =>
            item._id === deleteDialog.item!._id
              ? { ...item, isActive: updatedAgency.isActive }
              : item
          );
        });

        showSnackbar(
          `Agency ${
            updatedAgency.isActive ? "enabled" : "disabled"
          } successfully`,
          "success"
        );
      }

      setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined });
    } catch (error) {
      console.error("Error deleting Agency:", error);
      showSnackbar(
        deleteDialog.deleteType === 'hard' 
          ? "Failed to delete Agency permanently" 
          : `Failed to ${deleteDialog.item?.isActive ? "disable" : "enable"} Agency`,
        "error"
      );
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };


  // Delete handlers
  // const handleDelete = (item: Agency) => {
  //   setDeleteDialog({
  //     open: true,
  //     item,
  //     loading: false,
  //   });
  // };

  // const confirmDelete = async () => {
  //   if (!deleteDialog.item) return;

  //   setDeleteDialog((prev) => ({ ...prev, loading: true }));

  //   try {
  //     const updatedAgency = await updateResource(
  //       "/agency",
  //       deleteDialog.item._id as string,
  //        { isActive: !deleteDialog.item.isActive }
  //     );

  //     setAgency((prev: Agency[] | null) => {
  //       if (!prev) return [];
  //       return prev.map((item) =>
  //         item._id === deleteDialog.item!._id
  //           ? { ...item, isActive: updatedAgency.isActive }
  //           : item
  //       );
  //     });

  //     showSnackbar(
  //       `Agency ${
  //         updatedAgency.isActive ? "enabled" : "disabled"
  //       } successfully`,
  //       "success"
  //     );
  //     setDeleteDialog({ open: false, item: null, loading: false });
  //   } catch (error) {
  //     console.error("Error toggling Agency status:", error);
  //     showSnackbar(
  //       `Failed to ${
  //         deleteDialog.item.isActive ? "disable" : "enable"
  //       } Agency`,
  //       "error"
  //     );
  //     setDeleteDialog((prev) => ({ ...prev, loading: false }));
  //   }
  // };

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
      updatedAt: "",
        agencyName: "",
        agencyNumber: "",
      stateId: "",
      cityId: "",
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
  if (agency === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No Agency available</Alert>
      </Box>
    );
  }

const tableActions: TableAction<Agency>[] = [
  {
    icon: <Edit size={16} />,
    tooltip: "Edit item",
    color: "primary",
    onClick: handleEdit,
  },
  { 
    icon: <VisibilityOffIcon sx={{ fontSize: 16 }} />,
    tooltip: "Toggle item status",
    color: "warning",
    onClick: handleSoftDelete,
  },
];

// Only add hard delete action for admin and manager
if (user && ['admin', 'manager'].includes(user.role)) {
  tableActions.push({
    icon: <Trash2 size={16} />,
    tooltip: "Permanently delete item",
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
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Agencies</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Manage agencies and their details
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search agencies…"
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
          <AgencyImportExportButtons
            items={filteredItems}
            onImportComplete={() => {
              loadAgency();
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
            onClick={() => navigate("/AgencyForm")}
          >
            New agency
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
        onClose={() => {
          setEditDialog({ open: false, item: null });
          loadAgency(); // Refresh data after close
        }}
        type="agency"
        item={editDialog.item}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "Agency updated successfully!",
            severity: "success",
          });
          loadAgency(); // Explicit refresh
        }}
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
            ? "Permanently Delete Agency" 
            : deleteDialog.item?.isActive ? "Disable Agency" : "Enable Agency",
          description: deleteDialog.deleteType === 'hard'
            ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
            : deleteDialog.item?.isActive
              ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
              : "Are you sure you want to enable {itemName}?",
          variables: {
            itemName: deleteDialog.item?.agencyName || "",
          },
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
