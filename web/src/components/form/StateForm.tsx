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
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { State } from "../../api/types";
import { createResource, updateResource } from "../../api/api";

interface StateFormData {
  _id?: string;
  stateName: string;
  inActive?: boolean;
}

interface StateFormProps {
  stateData?: State | null;
  onSuccess?: () => void;
  dialogZIndex?: number;
}

export default function StateForm({ stateData, onSuccess }: StateFormProps) {
  const [formData, setFormData] = useState<StateFormData>({
    stateName: "",
    inActive: false,
  });

  const [errors, setErrors] = useState<Partial<StateFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const navigate = useNavigate();

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (stateData) {
      setFormData({
        _id: stateData._id,
        stateName: stateData.stateName,
        inActive: !stateData.isActive,
      });
    }
  }, [stateData]);

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
    if (errors[name as keyof StateFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StateFormData> = {};
    if (!formData.stateName.trim()) {
      newErrors.stateName = "State name is required";
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
        stateName: formData.stateName,
        isActive: !formData.inActive,
      };
      if (formData._id) {
        // Update existing State
        await updateResource("/states", formData._id, payload);
        showSnackbar("State updated successfully!", "success");
      } else {
        // Create new State
        await createResource("/states", payload);
        showSnackbar("State created successfully!", "success");
      }

      // Reset form if not in edit mode
      if (!stateData?._id) {
        setFormData({
          stateName: "",
          inActive: false,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate("/StatePage"), 1000);
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
          {stateData?._id ? "Edit state" : "New state"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {stateData?._id
            ? "Update the state details below."
            : "Add a new state."}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

        {/* State Name */}
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            id="stateName"
            name="stateName"
            label="State Name"
            variant="outlined"
            value={formData.stateName}
            onChange={handleInputChange}
            size="small"
            error={!!errors.stateName}
            helperText={errors.stateName}
            required
            disabled={isLoading}
          />
        </Box>

        {/* Status */}
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
          <NavLink to="/StatePage" className="nav-link">
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
          disabled={isLoading || !formData.stateName}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading
            ? "Processing..."
            : stateData?._id
            ? "Update"
            : "Save"}
        </Button>
      </Box>

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
