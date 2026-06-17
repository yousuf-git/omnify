import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  Button,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Inventory,
  AccountCircle,
  ExitToApp,
  Dashboard,
} from "@mui/icons-material";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources, updateResource } from "../api/api";
import { DynamicTable } from "../components/common/table";
import { Unauthorized } from "./Unauthorized";
import type { User } from "../api/types";
import { UserFilterPanel } from "../components/filter/UserFilterPanel";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
interface FilterUser {
  search: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UserManagementPage() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterUser>({
    search: "",
    name: "",
    email: "",
    role: "",
    createdAt: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: User | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: User | null;
    loading: boolean;
    deleteType: 'soft' | 'hard'; // Track delete type
  }>({ open: false, item: null, loading: false, deleteType: 'soft' });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const columns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    {
      id: "role",
      label: "Role",
      format: (_value: any, row: User) => (
        <Chip
          label={row.role}
          color={
            row.role === "admin"
              ? "primary"
              : row.role === "manager"
              ? "secondary"
              : "default"
          }
          size="small"
        />
      ),
    },
    {
      id: "status",
      label: "Status",
      format: (_value: any, row: User) => (
        <Chip
          label={row.isActive ? "Active" : "Inactive"}
          color={row.isActive ? "success" : "error"}
          size="small"
        />
      ),
    },
    {
      id: "createdAt",
      label: "Created At",
      format: (value: string) => new Date(value).toLocaleDateString("en-GB"),
    },
  ];

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources(`/users?showInactive=${showInactive}`);
      setUsers(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error("Error loading users:", err);
      showSnackbar(`Error: ${err.message}`, "error");
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "admin") {
      loadUsers();
    }
  }, [showInactive, currentUser]);

  const filteredItems = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !filters.search ||
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.role.toLowerCase().includes(filters.search.toLowerCase());

      const matchesName = !filters.name || user.name === filters.name;
      const matchesEmail = !filters.email || user.email === filters.email;
      const matchesRole = !filters.role || user.role === filters.role;
      const matchesCreatedAt =
        !filters.createdAt || user.createdAt === filters.createdAt;

      return matchesSearch && matchesName && matchesEmail && matchesRole && matchesCreatedAt;
    });
  }, [users, filters]);

  const handleEdit = (item: User) => {
    setEditDialog({ open: true, item });
  };

  // const handleDelete = (item: User) => {
  //   setDeleteDialog({ open: true, item, loading: false });
  // };

  // const confirmDelete = async () => {
  //   if (!deleteDialog.item) return;

  //   setDeleteDialog((prev) => ({ ...prev, loading: true }));

  //   try {
  //     const updatedUser = await updateResource("/users", deleteDialog.item._id as string, {
  //       isActive: !deleteDialog.item.isActive,
  //     });

  //     setUsers((prev) =>
  //       prev.map((item) =>
  //         item._id === deleteDialog.item!._id
  //           ? { ...item, isActive: updatedUser.isActive }
  //           : item
  //       )
  //     );

  //     showSnackbar(
  //       `User ${updatedUser.isActive ? "enabled" : "disabled"} successfully`,
  //       "success"
  //     );
  //     setDeleteDialog({ open: false, item: null, loading: false });
  //   } catch (error) {
  //     console.error("Error toggling user status:", error);
  //     showSnackbar(
  //       `Failed to ${deleteDialog.item.isActive ? "disable" : "enable"} user`,
  //       "error"
  //     );
  //     setDeleteDialog((prev) => ({ ...prev, loading: false }));
  //   }
  // };

    // Soft Delete - Toggle user status
  const handleSoftDelete = (item: User) => {
    setDeleteDialog({ 
      open: true, 
      item, 
      loading: false, 
      deleteType: 'soft' 
    });
  };

  // Hard Delete - Permanent deletion
  const handleHardDelete = (item: User) => {
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
        // Hard Delete - Permanent removal
        await deleteResource("/users", deleteDialog.item._id as string);

        // Remove from local state
        setUsers((prev) =>
          prev.filter((user) => user._id !== deleteDialog.item!._id)
        );

        showSnackbar("User permanently deleted successfully", "success");
      } else {
        // Soft Delete - Toggle active status
        const updatedUser = await updateResource(
          "/users", 
          deleteDialog.item._id as string, 
          { isActive: !deleteDialog.item.isActive }
        );

        // Update local state
        setUsers((prev) =>
          prev.map((user) =>
            user._id === deleteDialog.item!._id
              ? { ...user, isActive: updatedUser.isActive }
              : user
          )
        );

        showSnackbar(
          `User ${updatedUser.isActive ? "enabled" : "disabled"} successfully`,
          "success"
        );
      }

      setDeleteDialog({ open: false, item: null, loading: false, deleteType: 'soft' });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      
      // Handle specific error cases
      let errorMessage = "Failed to delete user";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (deleteDialog.deleteType === 'hard') {
        errorMessage = "Failed to permanently delete user";
      } else {
        errorMessage = `Failed to ${deleteDialog.item?.isActive ? "disable" : "enable"} user`;
      }

      showSnackbar(errorMessage, "error");
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
      name: "",
      email: "",
      role: "",
      createdAt: "",
    });
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Only show user management to admins
  if (currentUser?.role !== "admin") {
    return <Unauthorized />;
  }

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

  return (
    <Box className="flex flex-col">
      {/* <AppBar position="static" sx={{ backgroundColor: "#1E293B" }}>
        <Toolbar>
          <Inventory sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inventory System - User Management
          </Typography>
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleCloseMenu}>
                <Dashboard sx={{ mr: 2 }} />
                <Link to="/">Dashboard</Link>
              </MenuItem>
              <MenuItem onClick={logout}>
                <ExitToApp sx={{ mr: 2 }} />
                Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar> */}

      <Box className="flex flex-col flex-grow">
        {/* Header */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end", justifyContent: "space-between", mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "stretch", gap: 1.5 }}>
            <Box sx={{ width: "3px", borderRadius: "2px", bgcolor: "primary.main" }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Users</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                Manage system users and their permissions
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <TextField
              size="small"
              placeholder="Search users…"
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
              <span className="text-sm">{showInactive ? "Hide Inactive" : "Show Inactive"}</span>
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate("/UserForm")}
            >
              New user
            </Button>
          </Box>
        </Box>

      <UserFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        users={users} // Pass the users data
      />

        {/* Table */}
        <DynamicTable
          data={filteredItems}
          columns={columns}
          actions={[
            {
              icon: <Edit size={16} />,
              tooltip: "Edit user",
              color: "primary",
              onClick: handleEdit,
            },
             {
              icon: <VisibilityOffIcon  sx={{ fontSize: 16 }} />, // Toggle status icon
              tooltip: deleteDialog.item?.isActive ? "Disable user" : "Enable user",
              color: "warning",
              onClick: handleSoftDelete,
            },
            {
              icon: <Trash2 size={16} />,
              tooltip: "Permanently delete user",
              color: "error",
              onClick: handleHardDelete,
            },
          ]}
        />

        {/* Edit Dialog */}
        <EditItemDialog
          open={editDialog.open}
          onClose={() => setEditDialog({ open: false, item: null })}
          type="user"
          item={editDialog.item}
          onSuccess={loadUsers}
        />

      {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, item: null, loading: false, deleteType: 'soft' })}
          onConfirm={confirmDelete}
          isLoading={deleteDialog.loading}
          config={{
            title: deleteDialog.deleteType === 'hard' 
              ? "Permanently Delete User" 
              : deleteDialog.item?.isActive ? "Disable User" : "Enable User",
            description: deleteDialog.deleteType === 'hard'
              ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and all user data will be lost."
              : deleteDialog.item?.isActive
                ? "Are you sure you want to disable {itemName}? They will not be able to access the system until enabled again."
                : "Are you sure you want to enable {itemName}? They will regain access to the system.",
            variables: { itemName: deleteDialog.item?.name || "" },
            confirmText: deleteDialog.deleteType === 'hard' 
              ? "Delete Permanently" 
              : deleteDialog.item?.isActive ? "Disable" : "Enable",
            loadingText: deleteDialog.deleteType === 'hard'
              ? "Deleting..."
              : deleteDialog.item?.isActive ? "Disabling..." : "Enabling...",
          }}
          severity={deleteDialog.deleteType === 'hard' || (deleteDialog.deleteType === 'soft' && deleteDialog.item?.isActive) ? "error" : "success"}
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

      {/* <Box component="footer" className="py-4 bg-gray-100 text-center">
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()} Inventory System. All rights reserved.
        </Typography>
      </Box> */}
    </Box>
  );
}