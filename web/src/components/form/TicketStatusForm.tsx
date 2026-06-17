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
import type { TicketStatus } from "../../api/types";
import { createResource, updateResource } from "../../api/api";

interface TicketStatusFormData {
  _id?: string;
  name: string;
  description: string;
  inActive: boolean;
}

interface TicketStatusFormProps {
  ticketStatusData?: TicketStatus | null;
  onSuccess?: () => void;
}

export default function TicketStatusForm({
  ticketStatusData,
  onSuccess,
}: TicketStatusFormProps) {
  const [formData, setFormData] = useState<TicketStatusFormData>({
    name: "",
    description: "",
    inActive: false,
  });

  const [errors, setErrors] = useState<Partial<TicketStatusFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const navigate = useNavigate();

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (ticketStatusData) {
      setFormData({
        _id: ticketStatusData._id,
        name: ticketStatusData.name,
        description: ticketStatusData.description,
        inActive: !ticketStatusData.isActive,
      });
    }
  }, [ticketStatusData]);

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
    if (errors[name as keyof TicketStatusFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TicketStatusFormData> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Ticket status name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // In TicketStatusForm component
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        isActive: !formData.inActive,
      };
      // console.log("Submitting payload:", payload);

      if (formData._id) {
        await updateResource("/ticket-status", formData._id, payload);
        showSnackbar("Ticket status updated successfully!", "success");
      } else {
        await createResource("/ticket-status", payload);
        showSnackbar("Ticket status created successfully!", "success");
      }

      // Clear form only for new creations
      if (!formData._id) {
        setFormData({
          name: "",
          description: "",
          inActive: false,
        });
      }

      // Execute success callback
      showSnackbar(
        `Ticket Status ${formData._id ? "updated" : "created"} successfully!`,
        "success"
      );

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/TicketStatusPage");
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
          {ticketStatusData?._id ? "Edit ticket status" : "New ticket status"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {ticketStatusData?._id
            ? "Update the ticket status details below."
            : "Add a new ticket status option."}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

        <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Ticket Status Name"
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            size="small"
            error={!!errors.name}
            helperText={errors.name}
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
          <NavLink to="/TicketStatusPage" className="nav-link">
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
          disabled={isLoading || !formData.name}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading
            ? "Processing..."
            : ticketStatusData?._id
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
