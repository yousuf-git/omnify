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
import type { AssignedTo, FilterAssignedTo, TableColumn, TableAction } from "../api/types";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources, updateResource } from "../api/api";
import { DynamicTable } from "../components/common/table";
import { useNavigate } from "react-router-dom";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../contexts/AuthContext";

export default function AssignedToPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterAssignedTo>({
    search: "",
    name: "",
    updatedAt: "",
    createdAt: "",
  });

  const [assignedTo, setAssignedTo] = useState<AssignedTo[]>([]);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: AssignedTo | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: AssignedTo | null;
    loading: boolean;
    deleteType?: "soft" | "hard";
  }>({ open: false, item: null, loading: false });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const columns: TableColumn<AssignedTo>[] = [
    { id: "name", label: "Name" },
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

  const loadAssignedTo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources(
        `/assigned-to?showInactive=${showInactive}`
      );
      setAssignedTo(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error("Error loading Assigned To:", err);
      showSnackbar(`Error: ${err.message}`, "error");
      setError(
        err instanceof Error ? err.message : "Failed to load Assigned To"
      );
      setAssignedTo([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedTo();
  }, [showInactive]);

  const filteredItems = useMemo(() => {
    const safeItems = assignedTo || [];

    return safeItems.filter((item) => {
      const name = item.name || "";
      const updatedAt = item.updatedAt || "";
      const createdAt = item.createdAt || "";

      const matchesSearch =
        !filters.search ||
        name.toLowerCase().includes(filters.search.toLowerCase()) ||
        updatedAt.toLowerCase().includes(filters.search.toLowerCase()) ||
        createdAt.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCreatedAt =
        !filters.createdAt || item.createdAt === filters.createdAt;

      const matchesUpdatedAt =
        !filters.updatedAt || item.updatedAt === filters.updatedAt;

      const matchesName =
        !filters.name || item.name === filters.name;

      return (
        matchesSearch &&
        matchesCreatedAt &&
        matchesName &&
        matchesUpdatedAt
      );
    });
  }, [assignedTo, filters]);

  // Edit handlers
  const handleEdit = (item: AssignedTo) => {
    setEditDialog({ open: true, item });
  };

  const handleSoftDelete = (item: AssignedTo) => {
    setDeleteDialog({
      open: true,
      item,
      loading: false,
      deleteType: "soft",
    });
  };

  const handleHardDelete = (item: AssignedTo) => {
    if (!user || !['admin', 'manager'].includes(user.role)) {
      showSnackbar("You don't have permission to permanently delete Assigned To", "error");
      return;
    }
    setDeleteDialog({
      open: true,
      item,
      loading: false,
      deleteType: "hard",
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.item) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      if (deleteDialog.deleteType === "hard") {
        // Hard delete - permanent removal
        await deleteResource(
          "/assigned-to",
          `${deleteDialog.item._id}/hard-delete`
        );

        setAssignedTo((prev: AssignedTo[] | null) => {
          if (!prev) return [];
          return prev.filter((item) => item._id !== deleteDialog.item!._id);
        });

        showSnackbar("Assigned To permanently deleted successfully", "success");
      } else {
        // Soft delete - toggle active status
        const updatedAssignedTo = await updateResource(
          "/assigned-to",
          deleteDialog.item._id as string,
          { isActive: !deleteDialog.item.isActive }
        );

        setAssignedTo((prev: AssignedTo[] | null) => {
          if (!prev) return [];
          return prev.map((item) =>
            item._id === deleteDialog.item!._id
              ? { ...item, isActive: updatedAssignedTo.isActive }
              : item
          );
        });

        showSnackbar(
          `Assigned To ${
            updatedAssignedTo.isActive ? "enabled" : "disabled"
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
      console.error("Error deleting Assigned To:", error);
      showSnackbar(
        deleteDialog.deleteType === "hard"
          ? "Failed to delete Assigned To permanently"
          : `Failed to ${
              deleteDialog.item?.isActive ? "disable" : "enable"
            } Assigned To`,
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
      updatedAt: "",
      name: "",
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

  if (assignedTo === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No Assigned To available</Alert>
      </Box>
    );
  }

  const tableActions: TableAction<AssignedTo>[] = [
    { 
      icon: <Edit size={16} />, 
      tooltip: "Edit Assigned To", 
      color: "primary", 
      onClick: handleEdit 
    },
    {
      icon: <VisibilityOffIcon sx={{ fontSize: 16 }} />,
      tooltip: "Toggle Assigned To Status",
      color: "warning",
      onClick: handleSoftDelete,
    },
  ];

  if (user && ['admin', 'manager'].includes(user.role)) {
    tableActions.push({
      icon: <Trash2 size={16} />,
      tooltip: "Delete Assigned To",
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
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Assigned To</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Manage assignment owners
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search…"
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
          >
            <span className="text-[0.875rem]">
              {showInactive ? "Hide Inactive" : "Show Inactive"}
            </span>
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => navigate("/AssignedToForm")}
          >
            New entry
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
          loadAssignedTo();
        }}
        type="assignedTo"
        item={editDialog.item}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "Assigned To updated successfully!",
            severity: "success",
          });
          loadAssignedTo();
        }}
      />

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
              ? "Permanently Delete Assigned To"
              : deleteDialog.item?.isActive
              ? "Disable Assigned To"
              : "Enable Assigned To",
          description:
            deleteDialog.deleteType === "hard"
              ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
              : deleteDialog.item?.isActive
              ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
              : "Are you sure you want to enable {itemName}?",
          variables: {
            itemName: deleteDialog.item?.name || "",
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
