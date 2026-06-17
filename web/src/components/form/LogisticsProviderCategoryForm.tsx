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
import type { LogisticsProviderCategory } from "../../api/types";
import { createResource, updateResource } from "../../api/api";

interface LogisticsProviderCategoryFormProps {
  logisticsProviderCategoryData?: LogisticsProviderCategory | null;
  onSuccess?: () => void;
}

interface LogisticsProviderCategoryFormData {
  _id?: string;
  logisticsProviderCategoryName: string;
  inActive: boolean;
}

export default function LogisticsProviderCategoryForm({
  logisticsProviderCategoryData,
  onSuccess,
}: LogisticsProviderCategoryFormProps) {
  const [formData, setFormData] = useState<LogisticsProviderCategoryFormData>({
    logisticsProviderCategoryName: "",
    inActive: false,
  });

  const [errors, setErrors] = useState<Partial<LogisticsProviderCategory>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const navigate = useNavigate();

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (logisticsProviderCategoryData) {
      setFormData({
        _id: logisticsProviderCategoryData._id,
        logisticsProviderCategoryName:
          logisticsProviderCategoryData.logisticsProviderCategoryName,
        inActive: !logisticsProviderCategoryData.isActive,
      });
    }
  }, [logisticsProviderCategoryData]);

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
    if (errors[name as keyof LogisticsProviderCategory]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LogisticsProviderCategory> = {};
    if (!formData.logisticsProviderCategoryName.trim()) {
      newErrors.logisticsProviderCategoryName =
        "Logistics Provider Category name is required";
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
        logisticsProviderCategoryName: formData.logisticsProviderCategoryName,
        isActive: !formData.inActive,
      };
      if (formData._id) {
        // Update existing item group
        await updateResource(
          "/logistics-provider-categories",
          formData._id,
          payload
        );
        showSnackbar("Warehouse updated successfully!", "success");
      } else {
        // Create new item group
        await createResource("/logistics-provider-categories", payload);
        showSnackbar("Warehouse created successfully!", "success");
      }

      // Reset form after successful submission if not in edit mode
      if (!logisticsProviderCategoryData?._id) {
        setFormData({
          logisticsProviderCategoryName: "",
          inActive: false,
        });
      }

      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior - navigate to item groups page
        setTimeout(() => navigate("/LogisticsProviderCategoryPage"), 1000);
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
          {logisticsProviderCategoryData?._id ? "Edit logistics provider" : "New logistics provider"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {logisticsProviderCategoryData?._id
            ? "Update the logistics provider category details below."
            : "Add a new logistics provider category."}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            id="logisticsProviderCategoryName"
            name="logisticsProviderCategoryName"
            label="Logistics Provider Category Name"
            value={formData.logisticsProviderCategoryName}
            onChange={handleInputChange}
            error={!!errors.logisticsProviderCategoryName}
            helperText={errors.logisticsProviderCategoryName}
          />
        </Box>

        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
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
          <NavLink to="/LogisticsProviderCategoryPage" className="nav-link">
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
          disabled={isLoading || !formData.logisticsProviderCategoryName}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading
            ? "Processing..."
            : logisticsProviderCategoryData?._id
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
