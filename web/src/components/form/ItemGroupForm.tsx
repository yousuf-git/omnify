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
  IconButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ItemGroup } from "../../api/types";
import { createResource, updateResource } from "../../api/api";

interface ItemGroupFormData {
  _id?: string;
  itemGroupName: string;
  inActive: boolean;
}

interface ItemGroupFormProps {
  itemGroupData?: ItemGroup | null;
  onSuccess?: () => void;
}

export default function ItemGroupForm({
  itemGroupData,
  onSuccess,
}: ItemGroupFormProps) {
  const [formData, setFormData] = useState<ItemGroupFormData>({
    itemGroupName: "",
    inActive: false,
  });

  const [errors, setErrors] = useState<Partial<ItemGroupFormData>>({});
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
      navigate("/ItemGroupPage");
    }
  };

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (itemGroupData) {
      setFormData({
        _id: itemGroupData._id,
        itemGroupName: itemGroupData.itemGroupName,
        inActive: !itemGroupData.isActive,
      });
    }
  }, [itemGroupData]);

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
    if (errors[name as keyof ItemGroupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ItemGroupFormData> = {};
    if (!formData.itemGroupName.trim()) {
      newErrors.itemGroupName = "Group name is required";
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
        itemGroupName: formData.itemGroupName,
        isActive: !formData.inActive,
      };
      if (formData._id) {
        // Update existing item group
        await updateResource("/item-groups", formData._id, payload);
        showSnackbar("Item group updated successfully!", "success");
      } else {
        // Create new item group
        await createResource("/item-groups", payload);
        showSnackbar("Item group created successfully!", "success");
      }

      // Reset form after successful submission if not in edit mode
      if (!itemGroupData?._id) {
        setFormData({
          itemGroupName: "",
          inActive: false,
        });
      }

      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior - navigate to item groups page
        setTimeout(() => navigate("/ItemGroupPage"), 1000);
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
            {itemGroupData?._id ? "Edit item group" : "New item group"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {itemGroupData?._id
              ? "Update the item group details below."
              : "Create a group to organise your items."}
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
                id="itemGroupName"
                name="itemGroupName"
                label="Item Group Name"
                variant="outlined"
                value={formData.itemGroupName}
                onChange={handleInputChange}
                size="small"
                error={!!errors.itemGroupName}
                helperText={errors.itemGroupName}
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
            disabled={isLoading || !formData.itemGroupName}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading
              ? "Processing..."
              : itemGroupData?._id
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
