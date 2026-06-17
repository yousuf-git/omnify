import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  Chip,
  Paper,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { InstallationStatus } from "../../api/types";
import { createResource, updateResource } from "../../api/api";

interface InstallationStatusFormData {
  _id?: string;
  installationStatusName: string;
  description: string;
  inActive: boolean;
}

interface InstallationStatusFormProps {
  installationStatusData?: InstallationStatus | null;
  onSuccess?: () => void;
}

export default function InstallationStatusForm({
  installationStatusData,
  onSuccess,
}: InstallationStatusFormProps) {
  const [formData, setFormData] = useState<InstallationStatusFormData>({
    installationStatusName: "",
    description: "",
    inActive: false,
  });

  const [errors, setErrors] = useState<Partial<InstallationStatusFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const navigate = useNavigate();

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (installationStatusData) {
      setFormData({
        _id: installationStatusData._id,
        installationStatusName: installationStatusData.installationStatusName,
        description: installationStatusData.description,
        inActive: !installationStatusData.isActive,
      });
    }
  }, [installationStatusData]);

  // Initialize form with existing data if in edit mode

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name as keyof InstallationStatusFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<InstallationStatusFormData> = {};
    if (!formData.installationStatusName.trim()) {
      newErrors.installationStatusName = "Installation status name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        installationStatusName: formData.installationStatusName,
        description: formData.description,
        isActive: !formData.inActive,
      };
      if (formData._id) {
        // Update existing item group
        await updateResource("/installation-status", formData._id, payload);
        showSnackbar("Installation status updated successfully!", "success");
      } else {
        // Create new item group
        await createResource("/installation-status", payload);
        showSnackbar("Installation status created successfully!", "success");
      }

      // Reset form after successful submission if not in edit mode
      if (!installationStatusData?._id) {
        setFormData({
          installationStatusName: "",
          description: "",
          inActive: false,
        });
      }

      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior - navigate to item groups page
        setTimeout(() => navigate("/InstallationStatusPage"), 1000);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      showSnackbar(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pb: 6 }} className="flex flex-col w-full">
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>
          {installationStatusData?._id ? "Edit installation status" : "New installation status"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {installationStatusData?._id
            ? "Update the installation status details below."
            : "Add a new installation status option."}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

        <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TextField
            fullWidth
            id="installationStatusName"
            name="installationStatusName"
            label="Installation Status Name"
            variant="outlined"
            value={formData.installationStatusName}
            onChange={handleInputChange}
            size="small"
            error={!!errors.installationStatusName}
            helperText={errors.installationStatusName}
            required
            disabled={isLoading}
          />
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            variant="outlined"
            value={formData.description}
            onChange={handleInputChange}
            size="small"
            error={!!errors.description}
            helperText={errors.description}
            disabled={isLoading}
          />
        </Box>

        <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={!formData.inActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    inActive: !e.target.checked,
                  }))
                }
                disabled={isLoading}
              />
            }
            label="Status"
          />
          <Chip
            label={formData.inActive ? "Inactive" : "Active"}
            color={formData.inActive ? "error" : "success"}
            variant="outlined"
            size="small"
          />
        </Box>
      </Paper>

      {/* Form Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        {!onSuccess && (
          <NavLink to="/InstallationStatusPage" className="nav-link">
            <Button variant="outlined" disabled={isLoading}>
              Cancel
            </Button>
          </NavLink>
        )}
        {onSuccess && (
          <Button variant="outlined" onClick={onSuccess} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          type="submit"
          color="success"
          disabled={isLoading || !formData.installationStatusName}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading
            ? "Processing..."
            : installationStatusData?._id
            ? "Update"
            : "Save"}
        </Button>
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
