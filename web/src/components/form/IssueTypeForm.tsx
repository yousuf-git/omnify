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
import type { IssueType } from "../../api/types";
import { createResource, updateResource } from "../../api/api";

interface IssueTypeFormData {
  _id?: string;
  issueTypeName: string;
  description: string;
  inActive: boolean;
}

interface IssueTypeFormProps {
  issueTypeData?: IssueType | null;
  onSuccess?: () => void;
}

export default function IssueTypeForm({
  issueTypeData,
  onSuccess,
}: IssueTypeFormProps) {
  const [formData, setFormData] = useState<IssueTypeFormData>({
issueTypeName: "",
    description: "",
    inActive: false,
  });

  const [errors, setErrors] = useState<Partial<IssueTypeFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const navigate = useNavigate();

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (issueTypeData) {
      setFormData({
        _id: issueTypeData._id,
        issueTypeName: issueTypeData.issueTypeName,
        description: issueTypeData.description,
        inActive: !issueTypeData.isActive,
      });
    }
  }, [issueTypeData]);

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
    if (errors[name as keyof IssueTypeFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<IssueTypeFormData> = {};
    if (!formData.issueTypeName.trim()) {
      newErrors.issueTypeName = "Issue Type name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // In IssueTypeForm component
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        issueTypeName: formData.issueTypeName,
        description: formData.description,
        isActive: !formData.inActive,
      };
      // console.log("Submitting payload:", payload);

      if (formData._id) {
        await updateResource("/issue-type", formData._id, payload);
        showSnackbar("Issue Type updated successfully!", "success");
      } else {
        await createResource("/issue-type", payload);
        showSnackbar("Issue Type created successfully!", "success");
      }

      // Clear form only for new creations
      if (!formData._id) {
        setFormData({
          issueTypeName: "",
          description: "",
          inActive: false,
        });
      }

      // Execute success callback
      showSnackbar(
        `Issue Type ${formData._id ? "updated" : "created"} successfully!`,
        "success"
      );

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/IssueTypePage");
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
          {issueTypeData?._id ? "Edit issue type" : "New issue type"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {issueTypeData?._id
            ? "Update the issue type details below."
            : "Add a new issue type option."}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

        <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TextField
            fullWidth
            id="issueTypeName"
            name="issueTypeName"
            label="Issue Type Name"
            variant="outlined"
            value={formData.issueTypeName}
            onChange={handleInputChange}
            size="small"
            error={!!errors.issueTypeName}
            helperText={errors.issueTypeName}
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
          <NavLink to="/IssueTypePage" className="nav-link">
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
          disabled={isLoading || !formData.issueTypeName}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading
            ? "Processing..."
            : issueTypeData?._id
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
