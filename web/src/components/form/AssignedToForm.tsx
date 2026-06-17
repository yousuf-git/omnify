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
import type { AssignedTo } from "../../api/types";
import { createResource, getResources, updateResource } from "../../api/api";

interface AssignedToFormData {
  _id?: string;
  name: string;
  inActive: boolean;
}

interface AssignedToFormProps {
  assignedToData?: AssignedTo | null;
  onSuccess?: () => void;
  dialogZIndex?: number;
}

export default function AssignedToForm({
  assignedToData,
  onSuccess,
  dialogZIndex,
}: AssignedToFormProps) {
  const [formData, setFormData] = useState<AssignedToFormData>({
    name: "",
    inActive: false,
  });

  const [errors, setErrors] = useState<Partial<AssignedToFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const navigate = useNavigate();

  // Fetch existing names for uniqueness validation
  useEffect(() => {
    const fetchExistingNames = async () => {
      try {
        const response = await getResources("/assigned-to?showInactive=true");
        if (Array.isArray(response)) {
          const names = response
            .filter((item: AssignedTo) => item._id !== assignedToData?._id) // Exclude current item when editing
            .map((item: AssignedTo) => item.name.toLowerCase());
          setExistingNames(names);
        }
      } catch (error) {
        console.error("Failed to fetch existing names:", error);
      }
    };
    fetchExistingNames();
  }, [assignedToData]);

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (assignedToData) {
      setFormData({
        _id: assignedToData._id,
        name: assignedToData.name,
        inActive: !assignedToData.isActive,
      });
    }
  }, [assignedToData]);

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
    if (errors[name as keyof AssignedToFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AssignedToFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (existingNames.includes(formData.name.toLowerCase().trim())) {
      newErrors.name = "This name already exists. Please use a unique name.";
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
        name: formData.name.trim(),
        isActive: !formData.inActive,
      };

      if (formData._id) {
        await updateResource("/assigned-to", formData._id, payload);
        showSnackbar("Assigned To updated successfully!", "success");
      } else {
        await createResource("/assigned-to", payload);
        showSnackbar("Assigned To created successfully!", "success");
      }

      // Clear form only for new creations
      if (!formData._id) {
        setFormData({
          name: "",
          inActive: false,
        });
      }

      showSnackbar(
        `Assigned To ${formData._id ? "updated" : "created"} successfully!`,
        "success"
      );

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/AssignedToPage");
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
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
        {!onSuccess && (
          <IconButton onClick={() => navigate("/AssignedToPage")} size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
            <ArrowBack fontSize="small" />
          </IconButton>
        )}
        <Box>
          <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>
            {assignedToData?._id ? "Edit entry" : "New entry"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {assignedToData?._id
              ? "Update the assignment owner below."
              : "Add a new assignment owner."}
          </Typography>
        </Box>
      </Box>

      <Box className="flex flex-col gap-4">
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

          <Box className="flex flex-col gap-4" sx={{ mt: 1 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, alignItems: "flex-start" }}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Name"
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                size="small"
                error={!!errors.name}
                helperText={errors.name}
                disabled={isLoading}
              />
            </Box>

            {/* Active/Inactive Status */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.inActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        inActive: e.target.checked,
                      }))
                    }
                    name="inActive"
                    color="primary"
                  />
                }
                label="Mark as Inactive"
              />
              <Chip
                label={formData.inActive ? "Inactive" : "Active"}
                color={formData.inActive ? "error" : "success"}
                size="small"
              />
            </Box>
          </Box>
        </Paper>

        {/* Form Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => (onSuccess ? onSuccess() : navigate("/AssignedToPage"))}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : assignedToData?._id ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
