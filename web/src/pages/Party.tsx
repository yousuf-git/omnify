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
import type {
  FilterParty,
  Party,
  Reseller,
} from "../api/types";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { getResources, partiesAPI, updateResource } from "../api/api";
import { PartyList } from "../components/common/PartyList";
import { PartyImportExportButtons } from "../components/common/PartyImportExportButtons";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../contexts/AuthContext";

export default function PartyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [party, setParty] = useState<Party[] | null>(null); // Changed to nullable
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterParty>({
    search: "",
    partyId: "",
    partyName: "",
    address: "",
    cityId: "",
    stateId: "",
    gstn: "",
    shippingAddress: "",
    resellerId: "",
    resellerName: "",
    createdAt: "",
  });
  // const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: Party | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: Party | null;
    loading: boolean;
    deleteType?: "soft" | "hard"; // Add this
  }>({ open: false, item: null, loading: false });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const loadParty = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources(
        `/parties?showInactive=${showInactive}&populate=true`
      );
      //  console.log(response);
      setParty(Array.isArray(response) ? response : []); // Ensure we always have an array
    } catch (err: any) {
      console.error("Error loading parties:", err);
      showSnackbar(`Error: ${err.message}`, "error");
      setError(err instanceof Error ? err.message : "Failed to load parties");
      setParty([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParty();
  }, [showInactive]);

  // console.log(party);
  const filteredItems = useMemo(() => {
    // Safely handle null/undefined items
    const safeItems = party || [];

    return safeItems.filter((item) => {
      // Safely handle potentially undefined values
      // const partyId = item.partyId || "";
      const partyName = item.partyName || "";
      const address = item.address || "";
      const shoppingAddress = item.shippingAddress || "";
      const createdAt = item.createdAt || "";

      const gstn = item.gstn || "";

      // Handle populated city and state names for search
      const cityName =
        typeof item.cityId === "object" && item.cityId !== null
          ? (item.cityId as any).cityName || ""
          : "";

      const stateName =
        typeof item.stateId === "object" && item.stateId !== null
          ? (item.stateId as any).stateName || ""
          : "";

      const resellerName =
        typeof item.resellerId === "object" && item.resellerId !== null
          ? (item.resellerId as any).resellerName || ""
          : "";

      const matchesSearch =
        !filters.search ||
        // partyId.toLowerCase().includes(filters.search.toLowerCase()) ||
        partyName.toLowerCase().includes(filters.search.toLowerCase()) ||
        createdAt.toLowerCase().includes(filters.search.toLowerCase()) ||
        address.toLowerCase().includes(filters.search.toLowerCase()) ||
        cityName.toLowerCase().includes(filters.search.toLowerCase()) ||
        stateName.toLowerCase().includes(filters.search.toLowerCase()) ||
        shoppingAddress.toLowerCase().includes(filters.search.toLowerCase()) ||
        gstn.toLowerCase().includes(filters.search.toLowerCase()) ||
        resellerName.toLowerCase().includes(filters.search.toLowerCase());

      // const matchesPartyId =
      //   !filters.partyId ||
      //   item.partyId === filters.partyId;

      const matchesPartyName =
        !filters.partyName || item.partyName === filters.partyName;

      const matchesAddress =
        !filters.address || item.address === filters.address;

      const matchesShippingAddress =
        !filters.shippingAddress ||
        item.shippingAddress === filters.shippingAddress;

      const matchesGstn = !filters.gstn || item.gstn === filters.gstn;

      const matchesCreatedAt =
        !filters.createdAt || item.createdAt === filters.createdAt;

      // Handle city and state filter matching with both string IDs and objects
      const matchesCityId =
        !filters.cityId ||
        (typeof item.cityId === "string"
          ? item.cityId === filters.cityId
          : item.cityId?._id === filters.cityId);

      const matchesStateId =
        !filters.stateId ||
        (typeof item.stateId === "string"
          ? item.stateId === filters.stateId
          : item.stateId?._id === filters.stateId);

      const matchesResellerId =
        !filters.resellerId ||
        (typeof item.resellerId === "string"
          ? item.resellerId === filters.resellerId
          : item.resellerId?._id === filters.resellerId);

      return (
        matchesSearch &&
        // matchesPartyId &&
        matchesPartyName &&
        matchesAddress &&
        matchesShippingAddress &&
        matchesGstn &&
        matchesResellerId &&
        matchesCityId &&
        matchesStateId &&
        matchesCreatedAt
      );
    });
  }, [party, filters]);

  // ---- lookup maps for name resolution in the card list ----
  // City/State arrive populated (populate=true); the list resolves objects directly.
  const mapBy = (rows: any[]) => new Map(rows.map((r) => [r._id, r]));
  const cityMap = useMemo(() => mapBy([]), []);
  const stateMap = useMemo(() => mapBy([]), []);

  const handleEdit = (item: Party) => {
    setEditDialog({ open: true, item });
  };

  const handleSoftDelete = (item: Party) => {
    setDeleteDialog({
      open: true,
      item,
      loading: false,
      deleteType: "soft",
    });
  };

  const handleHardDelete = (item: Party) => {
    if (!user || !["admin", "manager"].includes(user.role)) {
      showSnackbar(
        "You don't have permission to permanently delete parties",
        "error"
      );
      return;
    }
    setDeleteDialog({
      open: true,
      item,
      loading: false,
      deleteType: "hard",
    });
  };

  // Update confirmDelete function
  const confirmDelete = async () => {
    if (!deleteDialog.item) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      if (deleteDialog.deleteType === "hard") {
        // Hard delete - permanent removal
        await partiesAPI.hardDelete(deleteDialog.item._id as string);

        setParty((prev: Party[] | null) => {
          if (!prev) return [];
          return prev.filter((item) => item._id !== deleteDialog.item!._id);
        });

        showSnackbar("Party permanently deleted successfully", "success");
      } else {
        // Soft delete - toggle active status
        const result = await partiesAPI.softDelete(
          deleteDialog.item._id as string,
          { isActive: !deleteDialog.item.isActive }
        );

        setParty((prev: Party[] | null) => {
          if (!prev) return [];
          return prev.map((item) =>
            item._id === deleteDialog.item!._id
              ? { ...item, isActive: result.party.isActive }
              : item
          );
        });

        showSnackbar(
          `Party ${
            result.party.isActive ? "enabled" : "disabled"
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
      console.error("Error deleting party:", error);
      showSnackbar(
        deleteDialog.deleteType === "hard"
          ? "Failed to delete party permanently"
          : `Failed to ${
              deleteDialog.item?.isActive ? "disable" : "enable"
            } party`,
        "error"
      );
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  // const handleDelete = (item: Party) => {
  //   setDeleteDialog({ open: true, item, loading: false });
  // };

  // const confirmDelete = async () => {
  //   if (!deleteDialog.item) return;

  //   setDeleteDialog((prev) => ({ ...prev, loading: true }));

  //   try {
  //     const updatedParty = await updateResource(
  //       "/parties",
  //       deleteDialog.item._id as string,
  //       { isActive: !deleteDialog.item.isActive }
  //     );

  //     setParty((prev: Party[] | null) => {
  //       if (!prev) return [];
  //       return prev.map((item) =>
  //         item._id === deleteDialog.item!._id
  //           ? { ...item, isActive: updatedParty.isActive }
  //           : item
  //       );
  //     });

  //     showSnackbar(
  //       `Party ${updatedParty.isActive ? "enabled" : "disabled"} successfully`,
  //       "success"
  //     );
  //     setDeleteDialog({ open: false, item: null, loading: false });
  //   } catch (error) {
  //     console.error("Error toggling party status:", error);
  //     showSnackbar(
  //       `Failed to ${deleteDialog.item.isActive ? "disable" : "enable"} party`,
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
      partyId: "",
      partyName: "",
      address: "",
      cityId: "",
      stateId: "",
      gstn: "",
      shippingAddress: "",
      resellerId: "",
      resellerName: "",
      createdAt: "",
    });
  };

  // const getStatusColor = (status: string): "success" | "error" | "warning" | "default" => {
  //   const normalized = status?.toLowerCase?.() ?? "";

  //   switch (normalized) {
  //     case "active":
  //     case "installed":
  //       return "success";

  //     case "inactive":
  //     case "failed":
  //       return "error";

  //     case "pending":
  //     case "in-progress":
  //       return "warning";

  //     default:
  //       return "default";
  //   }
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
  // Additional safety check
  if (party === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No Party data available</Alert>
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
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Parties</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Manage your parties and their details
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search parties…"
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
          <PartyImportExportButtons
            items={filteredItems}
            onImportComplete={loadParty}
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
            onClick={() => navigate("/PartyFormPage")}
          >
            New party
          </Button>
        </Box>
      </Box>

      {/* Record list */}
      <PartyList
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
        type="party"
        item={editDialog.item}
        onSuccess={loadParty}
      />

      {/* Delete Confirmation Dialog */}
      {/* <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null, loading: false })}
        onConfirm={confirmDelete}
        config={deleteDialog.item?.itemName || ""}
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
              ? "Permanently Delete Party"
              : deleteDialog.item?.isActive
              ? "Disable Party"
              : "Enable Party",
          description:
            deleteDialog.deleteType === "hard"
              ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
              : deleteDialog.item?.isActive
              ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
              : "Are you sure you want to enable {itemName}?",
          variables: { itemName: deleteDialog.item?.partyName || "" },
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
