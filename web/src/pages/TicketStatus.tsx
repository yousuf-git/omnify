// import { useEffect, useState, useMemo } from "react";
// import {
//   Box,
//   Typography,
//   Alert,
//   CircularProgress,
//   Snackbar,
//   Button,
//   Chip,
// } from "@mui/material";
// import { Edit, Plus, Trash2 } from "lucide-react";
// import type {
//   TicketStatus,
//   FilterTicketStatus,
//   TableColumn,
// } from "../api/types";
// import { EditItemDialog } from "../components/common/EditItemDialog";
// import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
// import { getResources, updateResource } from "../api/api";
// import { DynamicTable } from "../components/common/table";
// import { GenericFilterPanel } from "../components/filter/StockInCategoryFilterPanel";
// import { useNavigate } from "react-router-dom";

// export default function TicketStatusPage() {
//   const navigate = useNavigate();
//   const [showInactive, setShowInactive] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [filters, setFilters] = useState<FilterTicketStatus>({
//     search: "",
//     name: "",
//     updatedAt: "",
//     createdAt: "",
//   });

//   const [ticketStatus, setTicketStatus] = useState<TicketStatus[]>([]);
//   const [editDialog, setEditDialog] = useState<{
//     open: boolean;
//     item: TicketStatus | null;
//   }>({ open: false, item: null });
//   const [deleteDialog, setDeleteDialog] = useState<{
//     open: boolean;
//     item: TicketStatus | null;
//     loading: boolean;
//   }>({ open: false, item: null, loading: false });
//   const [snackbar, setSnackbar] = useState<{
//     open: boolean;
//     message: string;
//     severity: "success" | "error";
//   }>({ open: false, message: "", severity: "success" });

//   const columns: TableColumn<TicketStatus>[] = [
//     { id: "ticketStatusId", label: "Delivery Status Id" },
//     { id: "name", label: "Ticket Status Name" },
//     { id: "description", label: " Description" },
//     {
//       id: "status",
//       label: "Status",
//       format: (_value, row) => (
//         <Chip
//           label={row.isActive ? "Active" : "Inactive"}
//           color={row.isActive ? "success" : "error"}
//           size="small"
//         />
//       ),
//     },
//     {
//       id: "updatedAt",
//       label: "Updated At",
//       format: (value) => new Date(value).toLocaleDateString('en-GB'),
//     },
//     {
//       id: "createdAt",
//       label: "Created At",
//       format: (value) => new Date(value).toLocaleDateString('en-GB'),
//     },
//   ];

//   const loadTicketStatus = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await getResources(
//         `/ticket-status?showInactive=${showInactive}`
//       );
//       setTicketStatus(Array.isArray(response) ? response : []);
//     } catch (err:any) {
//       console.error("Error loading Ticket Status:", err);
//      showSnackbar(`Error: ${err.message}`, "error");
//       setError(
//         err instanceof Error ? err.message : "Failed to load Ticket Status"
//       );
//       setTicketStatus([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadTicketStatus();
//   }, [showInactive]);

//   const filteredItems = useMemo(() => {
//     // Safely handle null/undefined items
//     const safeItems = ticketStatus || [];

//     return safeItems.filter((item) => {
//       // Safely handle potentially undefined values
//       const name = item.name || "";
//       const updatedAt = item.updatedAt || "";
//       const createdAt = item.createdAt || "";

//       const matchesSearch =
//         !filters.search ||
//         name
//           .toLowerCase()
//           .includes(filters.search.toLowerCase()) ||
//         updatedAt.toLowerCase().includes(filters.search.toLowerCase()) ||
//         createdAt.toLowerCase().includes(filters.search.toLowerCase());

//       const matchesCreatedAt =
//         !filters.createdAt || item.createdAt === filters.createdAt;

//       const matchesUpdatedAt =
//         !filters.updatedAt || item.updatedAt === filters.updatedAt;

//       const matchesTicketStatus =
//         !filters.name ||
//         item.name === filters.name;

//       return (
//         matchesSearch &&
//         matchesCreatedAt &&
//         matchesTicketStatus &&
//         matchesUpdatedAt
//       );
//     });
//   }, [ticketStatus, filters]);

//   // Edit handlers
//   const handleEdit = (item: TicketStatus) => {
//     setEditDialog({ open: true, item });
//   };

//   // Delete handlers
//   const handleDelete = (item: TicketStatus) => {
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
//     // First get the current ticket status data
//     const currentTicketStatus = await getResources(`/ticket-status/${deleteDialog.item._id}`);
    
//     // Then update with all required fields + the isActive toggle
//     const updatedTicketStatus = await updateResource(
//       "/ticket-status",
//       deleteDialog.item._id as string,
//       {
//         name: currentTicketStatus.name,
//         description: currentTicketStatus.description,
//         isActive: !deleteDialog.item.isActive
//       }
//     );

//     setTicketStatus((prev: TicketStatus[] | null) => {
//       if (!prev) return [];
//       return prev.map((item) =>
//         item._id === deleteDialog.item!._id
//           ? { ...item, isActive: updatedTicketStatus.isActive }
//           : item
//       );
//     });

//     showSnackbar(
//       `Ticket Status ${updatedTicketStatus.isActive ? "enabled" : "disabled"} successfully`,
//       "success"
//     );
//     setDeleteDialog({ open: false, item: null, loading: false });
//   } catch (error) {
//     console.error("Error toggling Ticket status:", error);
//     showSnackbar(
//       `Failed to ${deleteDialog.item.isActive ? "disable" : "enable"} Ticket status`,
//       "error"
//     );
//     setDeleteDialog((prev) => ({ ...prev, loading: false }));
//   }
// };
//   const showSnackbar = (message: string, severity: "success" | "error") => {
//     setSnackbar({ open: true, message, severity });
//   };
//   const handleCloseSnackbar = () => {
//     setSnackbar((prev) => ({ ...prev, open: false }));
//   };

//   const clearFilters = () => {
//     setFilters({
//       search: "",
//       createdAt: "",
//       updatedAt: "",
//       name: "",
//     });
//   };

//   if (loading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="400px"
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert severity="error">{error}</Alert>
//       </Box>
//     );
//   }
//   // Additional safety check
//   if (ticketStatus === null) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert severity="warning">No Ticket Status available</Alert>
//       </Box>
//     );
//   }

//   return (
//     <Box
//       sx={{ p: 3 }}
//       className="flex flex-col mb-14 transition-all duration-900 ease-in-out"
//     >
//       {/* Header */}
//       <Box sx={{ mb: 2 }}>
//         <Typography
//           variant="h4"
//           sx={{ fontSize: "1.5rem" }}
//           fontWeight="bold"
//           gutterBottom
//         >
//           Ticket Status Management
//         </Typography>
//         <Typography
//           variant="body1"
//           sx={{ fontSize: "0.875rem", mt: -1.2 }}
//           color="text.secondary"
//         >
//           Manage Ticket Status
//         </Typography>
//       </Box>

//       {/* Actions Bar */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 2,
//           flexWrap: "wrap",
//           gap: 2,
//         }}
//       >
//         <Typography variant="h6" sx={{ fontSize: "1rem" }} fontWeight="medium">
//           Ticket Status ({filteredItems.length})
//         </Typography>
//         <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//           {/* <ImportExportButtons
//             items={filteredItems}
//             onImportComplete={loadItemsGroup}
//             isLoading={loading}
//           /> */}
//           <Button
//             variant="outlined"
//             onClick={() => setShowInactive(!showInactive)}
//             color={showInactive ? "primary" : "inherit"}
//           >
//             <span className="text-[0.875rem]">
//               {showInactive ? "Hide Inactive" : "Show Inactive"}
//             </span>
//           </Button>
//           <Button
//             variant="contained"
//             startIcon={<Plus size={16} />}
//             onClick={() => navigate("/TicketStatusForm")}
//             sx={{ fontSize: 12, py: 1 }}
//           >
//             <span className="hidden md:block">Add Ticket Status</span>
//           </Button>
//         </Box>
//       </Box>
//       <GenericFilterPanel
//         filters={filters}
//         onFiltersChange={setFilters}
//         onClearFilters={clearFilters}
//       />

//       {/* Table */}
//       <DynamicTable
//         data={filteredItems || []}
//         columns={columns}
//         actions={[
//           {
//             icon: <Edit size={16} />,
//             tooltip: "Edit item",
//             color: "primary",
//             onClick: handleEdit,
//           },
//           {
//             icon: <Trash2 size={16} />,
//             tooltip: "Delete item",
//             color: "error",
//             onClick: handleDelete,
//           },
//         ]}
//       />

//       {/* Edit Dialog */}
//       <EditItemDialog
//         open={editDialog.open}
//         onClose={() => {
//           setEditDialog({ open: false, item: null });
//           loadTicketStatus(); // Refresh data after close
//         }}
//         type="ticketStatus"
//         item={editDialog.item}
//         onSuccess={() => {
//           setSnackbar({
//             open: true,
//             message: "Ticket status updated successfully!",
//             severity: "success",
//           });
//           loadTicketStatus(); // Explicit refresh
//         }}
//       />

//       <ConfirmationDialog
//         open={deleteDialog.open}
//         onClose={() =>
//           setDeleteDialog({ open: false, item: null, loading: false })
//         }
//         onConfirm={confirmDelete}
//         isLoading={deleteDialog.loading}
//         config={{
//           title: deleteDialog.item?.isActive
//             ? "Disable Ticket Status"
//             : "Enable Installation Status",
//           description: deleteDialog.item?.isActive
//             ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
//             : "Are you sure you want to enable {itemName}?",
//           variables: {
//             itemName: deleteDialog.item?.name || "",
//           },
//           confirmText: deleteDialog.item?.isActive ? "Disable" : "Enable",
//           loadingText: deleteDialog.item?.isActive
//             ? "Disabling..."
//             : "Enabling...",
//         }}
//         severity={deleteDialog.item?.isActive ? "error" : "success"}
//         actionVariant={deleteDialog.item?.isActive ? "delete" : "update"}
//       />

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//       >
//         <Alert
//           onClose={handleCloseSnackbar}
//           severity={snackbar.severity}
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }

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
import type {
  TicketStatus,
  FilterTicketStatus,
  TableColumn,
  TableAction,
} from "../api/types";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { getResources, updateResource, deleteResource } from "../api/api";
import { DynamicTable } from "../components/common/table";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function TicketStatusPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterTicketStatus>({
    search: "",
    name: "",
    updatedAt: "",
    createdAt: "",
  });

  const [ticketStatus, setTicketStatus] = useState<TicketStatus[]>([]);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: TicketStatus | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: TicketStatus | null;
    loading: boolean;
    deleteType?: 'soft' | 'hard'; // Add this
  }>({ open: false, item: null, loading: false });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const columns: TableColumn<TicketStatus>[] = [
    { id: "name", label: "Ticket Status Name" },
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
      format: (value) => new Date(value).toLocaleDateString('en-GB'),
    },
    {
      id: "createdAt",
      label: "Created At",
      format: (value) => new Date(value).toLocaleDateString('en-GB'),
    },
  ];

  const loadTicketStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources(
        `/ticket-status?showInactive=${showInactive}`
      );
      setTicketStatus(Array.isArray(response) ? response : []);
    } catch (err:any) {
      console.error("Error loading Ticket Status:", err);
     showSnackbar(`Error: ${err.message}`, "error");
      setError(
        err instanceof Error ? err.message : "Failed to load Ticket Status"
      );
      setTicketStatus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketStatus();
  }, [showInactive]);

  const filteredItems = useMemo(() => {
    // Safely handle null/undefined items
    const safeItems = ticketStatus || [];

    return safeItems.filter((item) => {
      // Safely handle potentially undefined values
      const name = item.name || "";
      const updatedAt = item.updatedAt || "";
      const createdAt = item.createdAt || "";

      const matchesSearch =
        !filters.search ||
        name
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        updatedAt.toLowerCase().includes(filters.search.toLowerCase()) ||
        createdAt.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCreatedAt =
        !filters.createdAt || item.createdAt === filters.createdAt;

      const matchesUpdatedAt =
        !filters.updatedAt || item.updatedAt === filters.updatedAt;

      const matchesTicketStatus =
        !filters.name ||
        item.name === filters.name;

      return (
        matchesSearch &&
        matchesCreatedAt &&
        matchesTicketStatus &&
        matchesUpdatedAt
      );
    });
  }, [ticketStatus, filters]);

  // Edit handlers
  const handleEdit = (item: TicketStatus) => {
    setEditDialog({ open: true, item });
  };

  // Delete handlers
  const handleSoftDelete = (item: TicketStatus) => {
    setDeleteDialog({
      open: true,
      item,
      loading: false,
      deleteType: 'soft'
    });
  };

  const handleHardDelete = (item: TicketStatus) => {
    if (!user || !['admin', 'manager'].includes(user.role)) {
      showSnackbar("You don't have permission to permanently delete Ticket Status", "error");
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
          "/ticket-status", 
          `${deleteDialog.item._id}/hard-delete`
        );
        
        setTicketStatus((prev: TicketStatus[] | null) => {
          if (!prev) return [];
          return prev.filter((item) => item._id !== deleteDialog.item!._id);
        });

        showSnackbar("Ticket Status permanently deleted successfully", "success");
      } else {
        // Soft delete - toggle active status
        const updatedTicketStatus = await updateResource(
          "/ticket-status",
          deleteDialog.item._id as string,
          { isActive: !deleteDialog.item.isActive , name: deleteDialog.item.name, description: deleteDialog.item.description }
        );

        setTicketStatus((prev: TicketStatus[] | null) => {
          if (!prev) return [];
          return prev.map((item) =>
            item._id === deleteDialog.item!._id
              ? { ...item, isActive: updatedTicketStatus.isActive }
              : item
          );
        });

        showSnackbar(
          `Ticket Status ${
            updatedTicketStatus.isActive ? "enabled" : "disabled"
          } successfully`,
          "success"
        );
      }

      setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined });
    } catch (error) {
      console.error("Error deleting Ticket Status:", error);
      showSnackbar(
        deleteDialog.deleteType === 'hard' 
          ? "Failed to delete Ticket Status permanently" 
          : `Failed to ${deleteDialog.item?.isActive ? "disable" : "enable"} Ticket Status`,
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
  // Additional safety check
  if (ticketStatus === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No Ticket Status available</Alert>
      </Box>
    );
  }


  const tableActions: TableAction<TicketStatus>[] = [
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
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Ticket Status</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Manage ticket status options
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search ticket status…"
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
            onClick={() => navigate("/TicketStatusForm")}
          >
            New ticket status
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
          loadTicketStatus(); // Refresh data after close
        }}
        type="ticketStatus"
        item={editDialog.item}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "Ticket status updated successfully!",
            severity: "success",
          });
          loadTicketStatus(); // Explicit refresh
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
            ? "Permanently Delete Ticket Status" 
            : deleteDialog.item?.isActive 
              ? "Disable Ticket Status" 
              : "Enable Ticket Status",
          description: deleteDialog.deleteType === 'hard'
            ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
            : deleteDialog.item?.isActive
              ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
              : "Are you sure you want to enable {itemName}?",
          variables: {
            itemName: deleteDialog.item?.name || "",
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