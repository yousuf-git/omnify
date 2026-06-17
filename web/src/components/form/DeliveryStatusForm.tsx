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
import type { DeliveryStatus } from "../../api/types";
import { createResource, updateResource } from "../../api/api";

interface DeliveryStatusFormData {
  _id?: string;
  deliveryStatusName: string;
  description: string;
  inActive: boolean;
}

interface DeliveryStatusFormProps {
  deliveryStatusData?: DeliveryStatus | null;
  onSuccess?: () => void;
}

export default function DeliveryStatusForm({
  deliveryStatusData,
  onSuccess,
}: DeliveryStatusFormProps) {
  const [formData, setFormData] = useState<DeliveryStatusFormData>({
    deliveryStatusName: "",
    description: "",
    inActive: false,
  });

  const [errors, setErrors] = useState<Partial<DeliveryStatusFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const navigate = useNavigate();

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (deliveryStatusData) {
      setFormData({
        _id: deliveryStatusData._id,
        deliveryStatusName: deliveryStatusData.deliveryStatusName,
        description: deliveryStatusData.description,
        inActive: !deliveryStatusData.isActive,
      });
    }
  }, [deliveryStatusData]);

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
    if (errors[name as keyof DeliveryStatusFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DeliveryStatusFormData> = {};
    if (!formData.deliveryStatusName.trim()) {
      newErrors.deliveryStatusName = "Delivery status name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // In DeliveryStatusForm component
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        deliveryStatusName: formData.deliveryStatusName,
        description: formData.description,
        isActive: !formData.inActive,
      };
      // console.log("Submitting payload:", payload);

      if (formData._id) {
        await updateResource("/delivery-status", formData._id, payload);
        showSnackbar("Delivery status updated successfully!", "success");
      } else {
        await createResource("/delivery-status", payload);
        showSnackbar("Delivery status created successfully!", "success");
      }

      // Clear form only for new creations
      if (!formData._id) {
        setFormData({
          deliveryStatusName: "",
          description: "",
          inActive: false,
        });
      }

      // Execute success callback
      showSnackbar(
        `Delivery Status ${formData._id ? "updated" : "created"} successfully!`,
        "success"
      );

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/DeliveryStatusPage");
      }
    } catch (error) {
      showSnackbar(
        error instanceof Error ? error.message : "An error occurred",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pb: 6 }} className="flex flex-col w-full">
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>
          {deliveryStatusData?._id ? "Edit delivery status" : "New delivery status"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {deliveryStatusData?._id
            ? "Update the delivery status details below."
            : "Add a new delivery status option."}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

        <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TextField
            fullWidth
            id="deliveryStatusName"
            name="deliveryStatusName"
            label="Delivery Status Name"
            variant="outlined"
            value={formData.deliveryStatusName}
            onChange={handleInputChange}
            size="small"
            error={!!errors.deliveryStatusName}
            helperText={errors.deliveryStatusName}
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
          <NavLink to="/DeliveryStatusPage" className="nav-link">
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
          disabled={isLoading || !formData.deliveryStatusName}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading
            ? "Processing..."
            : deliveryStatusData?._id
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
