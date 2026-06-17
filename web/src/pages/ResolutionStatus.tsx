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
import type {
  ResolutionStatus,
  FilterResolutionStatus,
  TableColumn,
  TableAction,
} from "../api/types";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources, updateResource } from "../api/api";
import { DynamicTable } from "../components/common/table";
import { useNavigate } from "react-router-dom";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../contexts/AuthContext";

export default function ResolutionStatusPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterResolutionStatus>({
    search: "",
    resolutionStatusName: "",
    updatedAt: "",
    createdAt: "",
  });

  const [resolutionStatus, setResolutionStatus] = useState<ResolutionStatus[]>(
    []
  );
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: ResolutionStatus | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: ResolutionStatus | null;
    loading: boolean;
    deleteType?: "soft" | "hard"; // Add this
  }>({ open: false, item: null, loading: false });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const columns: TableColumn<ResolutionStatus>[] = [
    { id: "resolutionStatusName", label: "Name" },
    { id: "description", label: " Description" },
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

  const loadResolutionStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources(
        `/resolution-status?showInactive=${showInactive}`
      );
      setResolutionStatus(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error("Error loading Resolution Status:", err);
      showSnackbar(`Error: ${err.message}`, "error");
      setError(
        err instanceof Error ? err.message : "Failed to load Resolution Status"
      );
      setResolutionStatus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResolutionStatus();
  }, [showInactive]);

  const filteredItems = useMemo(() => {
    // Safely handle null/undefined items
    const safeItems = resolutionStatus || [];

    return safeItems.filter((item) => {
      // Safely handle potentially undefined values
      const resolutionStatusName = item.resolutionStatusName || "";
      const updatedAt = item.updatedAt || "";
      const createdAt = item.createdAt || "";

      const matchesSearch =
        !filters.search ||
        resolutionStatusName
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        updatedAt.toLowerCase().includes(filters.search.toLowerCase()) ||
        createdAt.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCreatedAt =
        !filters.createdAt || item.createdAt === filters.createdAt;

      const matchesUpdatedAt =
        !filters.updatedAt || item.updatedAt === filters.updatedAt;

      const matchesResolutionStatus =
        !filters.resolutionStatusName ||
        item.resolutionStatusName === filters.resolutionStatusName;

      return (
        matchesSearch &&
        matchesCreatedAt &&
        matchesResolutionStatus &&
        matchesUpdatedAt
      );
    });
  }, [resolutionStatus, filters]);

  // Edit handlers
  const handleEdit = (item: ResolutionStatus) => {
    setEditDialog({ open: true, item });
  };

  // Delete handlers
  //   const handleDelete = (item: ResolutionStatus) => {
  //     setDeleteDialog({
  //       open: true,
  //       item,
  //       loading: false,
  //     });
  //   };

  // const confirmDelete = async () => {
  //   if (!deleteDialog.item) return;

  //   setDeleteDialog((prev) => ({ ...prev, loading: true }));

  //   try {
  //     const updatedResolutionStatus = await updateResource(
  //       "/resolution-status",  // ✅ Changed to plural
  //       deleteDialog.item._id as string,
  //       { isActive: !deleteDialog.item.isActive }
  //     );

  //     setResolutionStatus((prev: ResolutionStatus[] | null) => {
  //       if (!prev) return [];
  //       return prev.map((item) =>
  //         item._id === deleteDialog.item!._id
  //           ? { ...item, isActive: updatedResolutionStatus.isActive }
  //           : item
  //       );
  //     });

  //     showSnackbar(
  //       `Resolution Status ${
  //         updatedResolutionStatus.isActive ? "enabled" : "disabled"
  //       } successfully`,
  //       "success"
  //     );
  //     setDeleteDialog({ open: false, item: null, loading: false });
  //   } catch (error) {
  //     console.error("Error toggling Resolution Status status:", error);
  //     showSnackbar(
  //       `Failed to ${
  //         deleteDialog.item.isActive ? "disable" : "enable"
  //       } Resolution Status`,
  //       "error"
  //     );
  //     setDeleteDialog((prev) => ({ ...prev, loading: false }));
  //   }
  // };

  const handleSoftDelete = (item: ResolutionStatus) => {
    setDeleteDialog({
      open: true,
      item,
      loading: false,
      deleteType: "soft",
    });
  };

  const handleHardDelete = (item: ResolutionStatus) => {
     if (!user || !['admin', 'manager'].includes(user.role)) {
      showSnackbar("You don't have permission to permanently delete Resolution Status", "error");
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
          "/resolution-status",
          `${deleteDialog.item._id}/hard-delete`
        );

        setResolutionStatus((prev: ResolutionStatus[] | null) => {
          if (!prev) return [];
          return prev.filter((item) => item._id !== deleteDialog.item!._id);
        });

        showSnackbar(
          "Resolution Status permanently deleted successfully",
          "success"
        );
      } else {
        // Soft delete - toggle active status
        const updatedResolutionStatus = await updateResource(
          "/resolution-status",
          deleteDialog.item._id as string,
          { isActive: !deleteDialog.item.isActive }
        );

        setResolutionStatus((prev: ResolutionStatus[] | null) => {
          if (!prev) return [];
          return prev.map((item) =>
            item._id === deleteDialog.item!._id
              ? { ...item, isActive: updatedResolutionStatus.isActive }
              : item
          );
        });

        showSnackbar(
          `Resolution Status ${
            updatedResolutionStatus.isActive ? "enabled" : "disabled"
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
      console.error("Error deleting Resolution Status:", error);
      showSnackbar(
        deleteDialog.deleteType === "hard"
          ? "Failed to delete Resolution Status permanently"
          : `Failed to ${
              deleteDialog.item?.isActive ? "disable" : "enable"
            } Resolution Status`,
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
      resolutionStatusName: "",
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
  if (resolutionStatus === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No Resolution Status available</Alert>
      </Box>
    );
  }
  const tableActions: TableAction<ResolutionStatus>[] = [
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
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Resolution Status</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Manage resolution status options
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search resolution status…"
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
            onClick={() => navigate("/ResolutionStatusForm")}
          >
            New resolution status
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
          loadResolutionStatus(); // Refresh data after close
        }}
        type="resolutionStatus"
        item={editDialog.item}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "Resolution Status updated successfully!",
            severity: "success",
          });
          loadResolutionStatus(); // Explicit refresh
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
              ? "Permanently Delete Resolution Status"
              : deleteDialog.item?.isActive
              ? "Disable Resolution Status"
              : "Enable Resolution Status",
          description:
            deleteDialog.deleteType === "hard"
              ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
              : deleteDialog.item?.isActive
              ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
              : "Are you sure you want to enable {itemName}?",
          variables: {
            itemName: deleteDialog.item?.resolutionStatusName || "",
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
