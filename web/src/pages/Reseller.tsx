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
import { useNavigate } from "react-router-dom";
import type { FilterReseller, Reseller } from "../api/types";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources, updateResource } from "../api/api";
import { ResellerList } from "../components/common/ResellerList";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from "../contexts/AuthContext";


export default function ResellerPage() {
  const navigate = useNavigate();
   const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [filters, setFilters] = useState<FilterReseller>({
    search: "",
    resellerName: "",
    createdAt: "",
  });

  const [reseller, setReseller] = useState<Reseller[]>([]);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: Reseller | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: Reseller | null;
    loading: boolean;
    deleteType?: 'soft' | 'hard'; // Add this
  }>({ open: false, item: null, loading: false });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });


  const loadReseller = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources(
        `/resellers?showInactive=${showInactive}&populate=true`
      );
      setReseller(Array.isArray(response) ? response : []);
    } catch (err:any) {
      console.error("Error loading items:", err);
       showSnackbar(`Error: ${err.message}`, "error");
      setError(
        err instanceof Error ? err.message : "Failed to load items Groups"
      );
      setReseller([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReseller();
  }, [showInactive]);

  const filteredItems = useMemo(() => {
    // Safely handle null/undefined items
    const safeItems = reseller || [];

    return safeItems.filter((item) => {
      // Safely handle potentially undefined values
      const resellerName = item.resellerName || "";
      const address = item.address || "";
      const gstn = item.gstn || "";
      const shippingAddress = item.shippingAddress || "";
      const createdAt = item.createdAt || "";
 // Handle populated city and state names for search
    const cityName = typeof item.cityId === 'object' && item.cityId !== null 
      ? (item.cityId as any).cityName || ""
      : "";
    
    const stateName = typeof item.stateId === 'object' && item.stateId !== null 
      ? (item.stateId as any).stateName || ""
      : "";


      const matchesSearch =
        !filters.search ||
        resellerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        address.toLowerCase().includes(filters.search.toLowerCase()) ||
        gstn.toLowerCase().includes(filters.search.toLowerCase()) ||
        shippingAddress.toLowerCase().includes(filters.search.toLowerCase()) ||
        createdAt.toLowerCase().includes(filters.search.toLowerCase())
        ||
        cityName.toLowerCase().includes(filters.search.toLowerCase())
        ||
        stateName.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCreatedAt =
        !filters.createdAt || item.createdAt === filters.createdAt;

      const matchesGroup =
        !filters.resellerName || item.resellerName === filters.resellerName;

 // Handle city and state filter matching with both string IDs and objects
    const matchesCityId = !filters.cityId || 
      (typeof item.cityId === 'string' 
        ? item.cityId === filters.cityId 
        : item.cityId?._id === filters.cityId);
    
    const matchesStateId = !filters.stateId || 
      (typeof item.stateId === 'string' 
        ? item.stateId === filters.stateId 
        : item.stateId?._id === filters.stateId);




      return matchesSearch && matchesCreatedAt && matchesGroup && matchesCityId && matchesStateId;
    });
  }, [reseller, filters]);

  // ---- lookup maps for the card list ----
  // City/State arrive populated (populate=true); the list resolves objects directly.
  const mapBy = (rows: any[]) => new Map(rows.map((r) => [r._id, r]));
  const cityMap = useMemo(() => mapBy([]), []);
  const stateMap = useMemo(() => mapBy([]), []);

  const handleEdit = (item: Reseller) => {
    setEditDialog({ open: true, item });
  };

  // const handleDelete = (item: Reseller) => {
  //   setDeleteDialog({ open: true, item, loading: false });
  // };

  // const confirmDelete = async () => {
  //   if (!deleteDialog.item) return;

  //   setDeleteDialog((prev) => ({ ...prev, loading: true }));

  //   try {
  //     const updatedReseller = await updateResource(
  //       "/resellers",
  //       deleteDialog.item._id as string,
  //       { isActive: !deleteDialog.item.isActive }
  //     );

  //     setReseller((prev: Reseller[] | null) => {
  //       if (!prev) return [];
  //       return prev.map((item) =>
  //         item._id === deleteDialog.item!._id
  //           ? { ...item, isActive: updatedReseller.isActive }
  //           : item
  //       );
  //     });

  //     showSnackbar(
  //       `Reseller ${
  //         updatedReseller.isActive ? "enabled" : "disabled"
  //       } successfully`,
  //       "success"
  //     );
  //     setDeleteDialog({ open: false, item: null, loading: false });
  //   } catch (error) {
  //     console.error("Error toggling reseller status:", error);
  //     showSnackbar(
  //       `Failed to ${
  //         deleteDialog.item.isActive ? "disable" : "enable"
  //       } reseller`,
  //       "error"
  //     );
  //     setDeleteDialog((prev) => ({ ...prev, loading: false }));
  //   }
  // };


   const handleSoftDelete = (item: Reseller) => {
    setDeleteDialog({ 
      open: true, 
      item, 
      loading: false,
      deleteType: 'soft'
    });
  };

  const handleHardDelete = (item: Reseller) => {
        if (!user || !['admin', 'manager'].includes(user.role)) {
      showSnackbar("You don't have permission to permanently delete resellers", "error");
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
        await deleteResource("/resellers", `${deleteDialog.item._id}/hard-delete`);
        
        setReseller((prev: Reseller[] | null) => {
          if (!prev) return [];
          return prev.filter((item) => item._id !== deleteDialog.item!._id);
        });

        showSnackbar("Reseller permanently deleted successfully", "success");
      } else {
        // Soft delete - toggle active status
        const updatedReseller = await updateResource(
          "/resellers",
          deleteDialog.item._id as string,
          { isActive: !deleteDialog.item.isActive }
        );

        setReseller((prev: Reseller[] | null) => {
          if (!prev) return [];
          return prev.map((item) =>
            item._id === deleteDialog.item!._id
              ? { ...item, isActive: updatedReseller.isActive }
              : item
          );
        });

        showSnackbar(
          `Reseller ${updatedReseller.isActive ? "enabled" : "disabled"} successfully`,
          "success"
        );
      }

      setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined });
    } catch (error) {
      console.error("Error deleting reseller:", error);
      showSnackbar(
        deleteDialog.deleteType === 'hard' 
          ? "Failed to delete reseller permanently" 
          : `Failed to ${deleteDialog.item?.isActive ? "disable" : "enable"} reseller`,
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
      resellerName: "",
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
  if (reseller === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No reseller data available</Alert>
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
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Resellers</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Manage your resellers and their details
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search resellers…"
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
            onClick={() => navigate("/ResellerForm")}
          >
            New reseller
          </Button>
        </Box>
      </Box>

      {/* Record list */}
      <ResellerList
        records={filteredItems || []}
        cityMap={cityMap}
        stateMap={stateMap}
        onEdit={handleEdit}
        onDelete={handleSoftDelete}
      />

      {/* Edit Dialog */}
      <EditItemDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, item: null })}
        type="reseller"
        item={editDialog.item}
        onSuccess={loadReseller}
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
            ? "Permanently Delete Reseller" 
            : deleteDialog.item?.isActive ? "Disable Reseller" : "Enable Reseller",
          description: deleteDialog.deleteType === 'hard'
            ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
            : deleteDialog.item?.isActive
              ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
              : "Are you sure you want to enable {itemName}?",
          variables: { itemName: deleteDialog.item?.resellerName || "" },
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
