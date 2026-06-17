import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Chip,
  Paper,
  IconButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Warehouse } from "../../api/types";
import { createResource, updateResource } from "../../api/api";

interface WarehouseFormData {
  _id?: string;
  warehouseName: string;
  inActive?: boolean;
}

interface WarehouseFormProps {
  warehouseData?: Warehouse | null;
  onSuccess?: () => void;
}

export default function WarehouseForm({
  warehouseData,
  onSuccess,
}: WarehouseFormProps) {
  const [formData, setFormData] = useState<WarehouseFormData>({
    warehouseName: "",
    inActive: false,
  });

  const [errors, setErrors] = useState<Partial<WarehouseFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      navigate("/WarehousePage");
    }
  };

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (warehouseData) {
      setFormData({
        _id: warehouseData._id,
        warehouseName: warehouseData.warehouseName,
        inActive: !warehouseData.isActive,
      });
    }
  }, [warehouseData]);

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
    if (errors[name as keyof WarehouseFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<WarehouseFormData> = {};
    if (!formData.warehouseName.trim()) {
      newErrors.warehouseName = "Warehouse name is required";
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
        warehouseName: formData.warehouseName,
        isActive: !formData.inActive,
      };
      if (formData._id) {
        // Update existing item group
        await updateResource("/warehouses", formData._id, payload);
        showSnackbar("Warehouse updated successfully!", "success");
      } else {
        // Create new item group
        await createResource("/warehouses", payload);
        showSnackbar("Warehouse created successfully!", "success");
      }

      // Reset form after successful submission if not in edit mode
      if (!warehouseData?._id) {
        setFormData({
          warehouseName: "",
          inActive: false,
        });
      }

      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior - navigate to item groups page
        setTimeout(() => navigate("/WarehousePage"), 1000);
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
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
        <IconButton onClick={handleCancel} size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>
            {warehouseData?._id ? "Edit warehouse" : "New warehouse"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {warehouseData?._id
              ? "Update the warehouse details below."
              : "Add a new storage warehouse."}
          </Typography>
        </Box>
      </Box>

      <Box className="flex flex-col gap-4">
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

          <Box className="flex flex-col gap-4" sx={{ mt: 1 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              <TextField
                fullWidth
                id="warehouseName"
                name="warehouseName"
                label="Warehouse Name"
                variant="outlined"
                value={formData.warehouseName}
                onChange={handleInputChange}
                size="small"
                error={!!errors.warehouseName}
                helperText={errors.warehouseName}
                required
                disabled={isLoading}
              />

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
            </Box>
          </Box>
        </Paper>

        {/* Form Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={isLoading || !formData.warehouseName}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading
              ? "Processing..."
              : warehouseData?._id
              ? "Update"
              : "Save"}
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
