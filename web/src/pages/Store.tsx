import { useEffect, useState, useMemo, useCallback } from "react";
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
import type { FilterStore, Store, TableAction, TableColumn } from "../api/types";
import { deleteResource, getResources, updateResource } from "../api/api";
import { DynamicTable } from "../components/common/table";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ImportExportStoreButton } from "../components/common/ImportExportStoreButton";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../contexts/AuthContext";

export default function StorePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterStore>({
    search: "",
    storeId: 0,
    storeName: "",
    cityId: "",
    stateId: "",
    storeState: "",
    storeAddress: "",
    storePinCode: "",
    smName: "",
    smContactNo: "",
  });
  const [stores, setStores] = useState<Store[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: Store | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: Store | null;
    loading: boolean;
    deleteType?: "soft" | "hard"; // Add this
  }>({ open: false, item: null, loading: false });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both stores and parties in parallel
      const [storesResponse] = await Promise.all([
        getResources(
          `/stores?showInactive=${showInactive}&populate=true`
        ) as Promise<Store[]>,
      ]);

      // Ensure we have arrays even if the response is null/undefined
      const storesData = Array.isArray(storesResponse) ? storesResponse : [];

      // Merge party names into stores
      const mergedStores = storesData.map((store) => {
        return {
          ...store,
        };
      });

      setStores(mergedStores);
    } catch (err: any) {
      console.error("Error loading data:", err);
      showSnackbar(`Error: ${err.message}`, "error");
      setError(err instanceof Error ? err.message : "Failed to load data");
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns: TableColumn<Store>[] = [
    {
      id: "partyId",
      label: "Party Name",
      format: (_value, row) => (
        <span>
          {typeof row.partyId === "object" && row.partyId !== null
            ? (row.partyId as any).partyName
            : "N/A"}
        </span>
      ),
    },
    { id: "storeName", label: "Store Name" },
    {
      id: "cityId",
      label: "City",
      format: (_value, row) => (
        <span>
          {typeof row.cityId === "object" && row.cityId !== null
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
          {typeof row.stateId === "object" && row.stateId !== null
            ? (row.stateId as any).stateName
            : "N/A"}
        </span>
      ),
    },
    { id: "storeAddress", label: "Store Address" },
    { id: "storePinCode", label: "Store Pin Code" },
    { id: "smName", label: "SM Name" },
    { id: "smContactNo", label: "SM Contact No" },
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
      format: (value) =>
        value ? new Date(value).toLocaleDateString("en-GB") : "N/A",
    },
    {
      id: "createdAt",
      label: "Created At",
      format: (value) =>
        value ? new Date(value).toLocaleDateString("en-GB") : "N/A",
    },
  ];

  const filteredItems = useMemo(() => {
    return stores.filter((item) => {
      // Handle populated city and state names for search
      const cityName =
        typeof item.cityId === "object" && item.cityId !== null
          ? (item.cityId as any).cityName || ""
          : "";

      const stateName =
        typeof item.stateId === "object" && item.stateId !== null
          ? (item.stateId as any).stateName || ""
          : "";

      const matchesSearch =
        !filters.search ||
        (item.storeId?.toString() || "").includes(filters.search) ||
        (item.storeName?.toLowerCase() || "").includes(
          filters.search.toLowerCase()
        ) ||
        (item.storeState?.toLowerCase() || "").includes(
          filters.search.toLowerCase()
        ) ||
        (item.storeAddress?.toLowerCase() || "").includes(
          filters.search.toLowerCase()
        ) ||
        (item.storePinCode?.toLowerCase() || "").includes(
          filters.search.toLowerCase()
        ) ||
        (item.smName?.toLowerCase() || "").includes(
          filters.search.toLowerCase()
        ) ||
        (item.smContactNo?.toLowerCase() || "").includes(
          filters.search.toLowerCase()
        ) ||
        cityName.toLowerCase().includes(filters.search.toLowerCase()) ||
        stateName.toLowerCase().includes(filters.search.toLowerCase()) ||
        (item.updatedAt?.toLowerCase() || "").includes(
          filters.search.toLowerCase()
        ) ||
        (item.createdAt?.toLowerCase() || "").includes(
          filters.search.toLowerCase()
        );

      // Handle city filter (both string ID and populated object)
      const itemCityId =
        typeof item.cityId === "object" && item.cityId !== null
          ? (item.cityId as any)._id
          : item.cityId;

      const matchesStoreCity = !filters.cityId || itemCityId === filters.cityId;

      // Handle state filter (both string ID and populated object)
      const itemStateId =
        typeof item.stateId === "object" && item.stateId !== null
          ? (item.stateId as any)._id
          : item.stateId;

      const matchesState = !filters.stateId || itemStateId === filters.stateId;

      const matchesStoreId =
        !filters.storeId || item.storeId === filters.storeId;

      const matchesStoreName =
        !filters.storeName || item.storeName === filters.storeName;

      const matchesStoreState =
        !filters.storeState || item.storeState === filters.storeState;

      const matchesStoreAddress =
        !filters.storeAddress || item.storeAddress === filters.storeAddress;

      const matchesStorePinCode =
        !filters.storePinCode || item.storePinCode === filters.storePinCode;

      const matchesSmName = !filters.smName || item.smName === filters.smName;

      const matchesSmContactNo =
        !filters.smContactNo || item.smContactNo === filters.smContactNo;

      return (
        matchesSearch &&
        matchesStoreId &&
        matchesStoreName &&
        matchesStoreCity &&
        matchesStoreState &&
        matchesStoreAddress &&
        matchesState &&
        matchesStorePinCode &&
        matchesSmName &&
        matchesSmContactNo
      );
    });
  }, [stores, filters]);

  const handleEdit = (item: Store) => {
    setEditDialog({ open: true, item });
  };

  // const handleDelete = (item: Store) => {
  //   setDeleteDialog({ open: true, item, loading: false });
  // };

  // const confirmDelete = async () => {
  //   if (!deleteDialog.item) return;

  //   setDeleteDialog((prev) => ({ ...prev, loading: true }));

  //   try {
  //     const updatedStore = await updateResource(
  //       "/stores",
  //       deleteDialog.item._id as string,
  //       { isActive: !deleteDialog.item.isActive }
  //     );

  //     setStores((prev: Store[] | null) => {
  //       if (!prev) return [];
  //       return prev.map((item) =>
  //         item._id === deleteDialog.item!._id
  //           ? { ...item, isActive: updatedStore.isActive }
  //           : item
  //       );
  //     });

  //     showSnackbar(
  //       `Store ${updatedStore.isActive ? "enabled" : "disabled"} successfully`,
  //       "success"
  //     );
  //     setDeleteDialog({ open: false, item: null, loading: false });
  //   } catch (error) {
  //     console.error("Error toggling store status:", error);
  //     showSnackbar(
  //       `Failed to ${deleteDialog.item.isActive ? "disable" : "enable"} store`,
  //       "error"
  //     );
  //     setDeleteDialog((prev) => ({ ...prev, loading: false }));
  //   }
  // };

  // Replace the handleDelete function with these two functions:
  const handleSoftDelete = (item: Store) => {
    setDeleteDialog({
      open: true,
      item,
      loading: false,
      deleteType: "soft",
    });
  };

  const handleHardDelete = (item: Store) => {
    if (!user || !["admin", "manager"].includes(user.role)) {
      showSnackbar(
        "You don't have permission to permanently delete stores",
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

  // Update the confirmDelete function:
  const confirmDelete = async () => {
    if (!deleteDialog.item) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      if (deleteDialog.deleteType === "hard") {
        // Hard delete - permanent removal
        await deleteResource("/stores", `${deleteDialog.item._id}/hard-delete`);

        setStores((prev: Store[] | null) => {
          if (!prev) return [];
          return prev.filter((item) => item._id !== deleteDialog.item!._id);
        });

        showSnackbar("Store permanently deleted successfully", "success");
      } else {
        // Soft delete - toggle active status
        const updatedStore = await updateResource(
          "/stores",
          deleteDialog.item._id as string,
          { isActive: !deleteDialog.item.isActive }
        );

        setStores((prev: Store[] | null) => {
          if (!prev) return [];
          return prev.map((item) =>
            item._id === deleteDialog.item!._id
              ? { ...item, isActive: updatedStore.isActive }
              : item
          );
        });

        showSnackbar(
          `Store ${
            updatedStore.isActive ? "enabled" : "disabled"
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
      console.error("Error deleting store:", error);
      showSnackbar(
        deleteDialog.deleteType === "hard"
          ? "Failed to delete store permanently"
          : `Failed to ${
              deleteDialog.item?.isActive ? "disable" : "enable"
            } store`,
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
  if (stores === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No store data available</Alert>
      </Box>
    );
  }

  const tableActions: TableAction<Store>[] = [
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
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Stores</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Manage store locations & managers
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search stores…"
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
          <ImportExportStoreButton
            items={filteredItems}
            onImportComplete={loadData}
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
            onClick={() => navigate("/StoreFormPage")}
          >
            New store
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
        type="store"
        item={editDialog.item}
        onSuccess={loadData}
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
              ? "Permanently Delete Store"
              : deleteDialog.item?.isActive
              ? "Disable Store"
              : "Enable Store",
          description:
            deleteDialog.deleteType === "hard"
              ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
              : deleteDialog.item?.isActive
              ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
              : "Are you sure you want to enable {itemName}?",
          variables: { itemName: deleteDialog.item?.storeName || "" },
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
