// UserForm.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { ArrowBack, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

import type { User } from "../../api/types";
import { createResource, getResource, updateResource } from "../../api/api";

interface UserFormData {
  _id?: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "manager" | "staff" | "viewer";
  isActive: boolean;
}

interface UserFormProps {
  userData?: User | null;
  onSuccess?: () => void;
  isEditMode?: boolean;
}

export default function UserForm({ userData, onSuccess, isEditMode }: UserFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "staff",
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  // Fetch user data if in edit mode and ID is provided
  useEffect(() => {
    if (id && !userData) {
      fetchUserData();
    } else if (userData) {
      setFormData({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        password: "",
        confirmPassword: "",
        role: userData.role as UserFormData["role"],
        isActive: userData.isActive,
      });
    }
  }, [id, userData]);

  const fetchUserData = async () => {
    try {
      setFetching(true);
      const user = await getResource("/users", id as string);
      setFormData({
        _id: user._id,
        name: user.name,
        email: user.email,
        password: "",
        confirmPassword: "",
        role: user.role,
        isActive: user.isActive,
      });
    } catch (error: any) {
      console.error("Error fetching user:", error);
      showSnackbar(error.message || "Failed to fetch user data", "error");
      navigate("/users");
    } finally {
      setFetching(false);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name as keyof UserFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation only for new users or when password is being changed
    if (!isEditMode || formData.password) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Only include password if it's provided (for new users or password change)
      if (formData.password) {
        payload.password = formData.password;
      }

      if (formData._id) {
        // Update existing user
        await updateResource("/users", formData._id, payload);
        showSnackbar("User updated successfully!", "success");
      } else {
        // Create new user
        await createResource("/users", payload);
        showSnackbar("User created successfully!", "success");
      }

      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior - navigate to users page
        setTimeout(() => navigate("/UserManagementPage"), 1000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pb: 6 }} className="flex flex-col w-full">
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
        {!onSuccess && (
          <IconButton onClick={() => navigate("/UserManagementPage")} size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
            <ArrowBack fontSize="small" />
          </IconButton>
        )}
        <Box>
          <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>
            {formData._id ? "Edit user" : "New user"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {formData._id
              ? "Update the user details below."
              : "Add a new user to the system."}
          </Typography>
        </Box>
      </Box>

      <Box className="flex flex-col gap-4">
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>Account details</Typography>

          {/* Form Fields Container */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* First Row - Name and Email */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Full Name"
                  variant="outlined"
                  size="small"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  disabled={loading}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  size="small"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  disabled={loading}
                />
              </Box>
            </Box>

            {/* Second Row - Password and Confirm Password */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  size="small"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!errors.password}
                  helperText={errors.password || (isEditMode ? "Leave blank to keep current password" : "")}
                  required={!isEditMode}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  variant="outlined"
                  size="small"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  required={!isEditMode || formData.password !== ""}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            {/* Third Row - Role and Status */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
              <Box>
                <FormControl fullWidth size="small" error={!!errors.role} disabled={loading}>
                  <InputLabel id="role-label">Role *</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formData.role}
                    label="Role *"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="viewer">Viewer</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                  {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Status:
                </Typography>
                <Chip
                  label={formData.isActive ? "Active" : "Inactive"}
                  color={formData.isActive ? "success" : "error"}
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  disabled={loading}
                >
                  {formData.isActive ? "Deactivate" : "Activate"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Form Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => (onSuccess ? onSuccess() : navigate("/UserManagementPage"))}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading
              ? "Processing..."
              : formData._id
              ? "Update User"
              : "Create User"}
          </Button>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
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