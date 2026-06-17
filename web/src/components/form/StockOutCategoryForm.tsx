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
import type { StockOutCategory } from "../../api/types";
import { createResource, updateResource } from "../../api/api";

interface StockOutCategoryFormData {
  _id?: string;
  stockOutCategoryName: string;
  description: string;
  inActive?: boolean;
}

interface StockOutCategoryFormProps {
  stockOutCategoryData?: StockOutCategory | null;
  onSuccess?: () => void;
}

export default function StockOutCategoryForm({
  stockOutCategoryData,
  onSuccess,
}: StockOutCategoryFormProps) {
  const [formData, setFormData] = useState<StockOutCategoryFormData>({
    stockOutCategoryName: "",
    description: "",
    inActive: false,
  });

  const [errors, setErrors] = useState<Partial<StockOutCategoryFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const navigate = useNavigate();

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (stockOutCategoryData) {
      setFormData({
        _id: stockOutCategoryData._id,
        stockOutCategoryName: stockOutCategoryData.stockOutCategoryName,
        description: stockOutCategoryData.description,
        inActive: !stockOutCategoryData.isActive,
      });
    }
  }, [stockOutCategoryData]);

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
    if (errors[name as keyof StockOutCategoryFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StockOutCategoryFormData> = {};
    if (!formData.stockOutCategoryName.trim()) {
      newErrors.stockOutCategoryName = "Stock Out Category name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
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
        stockOutCategoryName: formData.stockOutCategoryName,
        description: formData.description,
        isActive: !formData.inActive,
      };

      // console.log("Submitting payload:", payload); // Debug log
      if (formData._id) {
        // Update existing item group
        await updateResource("/stock-out-categories", formData._id, payload);
        showSnackbar("Stock Out Category updated successfully!", "success");
      } else {
        // Create new item group
        await createResource("/stock-out-categories", payload);
        showSnackbar("Stock Out Category created successfully!", "success");
      }

      // Reset form after successful submission if not in edit mode
      if (!stockOutCategoryData?._id) {
        setFormData({
          stockOutCategoryName: "",
          description: "",
          inActive: false,
        });
      }

      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior - navigate to item groups page
        setTimeout(() => navigate("/StockOutCategoryPage"), 1000);
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
          {stockOutCategoryData?._id ? "Edit stock out category" : "New stock out category"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {stockOutCategoryData?._id
            ? "Update the stock out category details below."
            : "Add a new category for outbound inventory movements."}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

        <Box className="flex flex-col gap-4" sx={{ mt: 1 }}>
          {/* Stock Out Category Name */}
          <TextField
            fullWidth
            id="stockOutCategoryName"
            name="stockOutCategoryName"
            label="Stock Out Category Name"
            variant="outlined"
            value={formData.stockOutCategoryName}
            onChange={handleInputChange}
            size="small"
            error={!!errors.stockOutCategoryName}
            helperText={errors.stockOutCategoryName}
            required
            disabled={isLoading}
          />

          {/* Description */}
          <TextField
            fullWidth
            multiline
            rows={4}
            id="description"
            name="description"
            label="Description"
            variant="outlined"
            value={formData.description}
            onChange={handleInputChange}
            size="small"
            error={!!errors.description}
            helperText={errors.description}
            required
            disabled={isLoading}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
      </Paper>

      {/* Form Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        {!onSuccess && (
          <NavLink to="/StockOutCategoryPage" className="nav-link">
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
          disabled={isLoading || !formData.stockOutCategoryName}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading
            ? "Processing..."
            : stockOutCategoryData?._id
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
