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
  Autocomplete,
  createFilterOptions,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createResource, getResources, updateResource } from "../../api/api";
import { Plus } from "lucide-react";
import { useNestedEntity } from "../../contexts/NestedEntityContext";


export interface CityFormData {
  _id?: string;
  cityId?: string;
  cityName: string;
  stateId: string | State;
  inActive?: boolean;
}

interface State {
  _id: string;
  stateName: string;
}

interface CityFormProps {
  cityData?: CityFormData | null | undefined;
  onSuccess?: () => void;
  dialogZIndex?: number;
}

export default function CityForm({ cityData, onSuccess, dialogZIndex }: CityFormProps) {
  const [formData, setFormData] = useState<CityFormData>({
    cityName: "",
    stateId: "",
    inActive: false,
  });

  const [errors, setErrors] = useState<Partial<CityFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [state, setState] = useState<State[]>([]);
const [stateLoading, setStateLoading] = useState(false);
const [stateError, setStateError] = useState<string | null>(null);


  const navigate = useNavigate();
  const { openDialog, registerRefreshCallback } = useNestedEntity();

  // Refresh function for states
  const refreshStates = async () => {
    await loadStates();
  };

  // Register refresh callback
  useEffect(() => {
    registerRefreshCallback('state', refreshStates);
  }, [registerRefreshCallback]);

  // Handler for adding new state
  const handleAddState = () => {
    openDialog('state', () => {
      refreshStates();
    });
  };

  // Load cities from API
  const loadStates = async () => {
    try {
setStateLoading(true);
      setStateError(null);
      const response = await getResources("/states");
      setState(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error loading states:", err);
      setStateError(
        err instanceof Error ? err.message : "Failed to load states"
      );
      setState([]);
    } finally {
setStateLoading(false);
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

useEffect(() => {
  if (cityData) {
    // Extract cityId whether it's a string or City object
    const cityIdValue = typeof cityData.stateId === 'string' 
      ? cityData.stateId 
      : cityData.stateId?._id || '';

    setFormData({
      ...cityData,
      stateId: cityIdValue,
    });
  }
}, [cityData]);

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

    if (errors[name as keyof CityFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CityFormData> = {};

    if (!formData.cityName.trim()) newErrors.cityName = "City name is required";
    if (!formData.stateId) newErrors.stateId = "State is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        cityName: formData.cityName,
        stateId: formData.stateId,
        isActive: !formData.inActive,
      };

      if (formData._id) {
        await updateResource("/cities", formData._id, payload);
        showSnackbar("City updated successfully!", "success");
      } else {
        await createResource("/cities", payload);
        showSnackbar("City created successfully!", "success");
      }

      if (!cityData?._id) {
        setFormData({
          cityName: "",
          stateId: "",
          inActive: false,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate("/CityPage"), 1000);
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
          {cityData?._id ? "Edit city" : "New city"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {cityData?._id
            ? "Update the city details below."
            : "Add a new city and assign it to a state."}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

        <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, alignItems: "flex-start" }}>
          {/* City Name */}
          <TextField
            fullWidth
            size="small"
            label="City Name"
            name="cityName"
            value={formData.cityName}
            onChange={handleInputChange}
            error={!!errors.cityName}
            helperText={errors.cityName}
          />

       <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
          <Autocomplete
            size="small"
            id="state-select"
            options={[...state].sort((a, b) => a.stateName.localeCompare(b.stateName))}
            getOptionLabel={(option) => option.stateName}
            filterOptions={createFilterOptions({
              matchFrom: 'any',
              stringify: (option: typeof state[0]) => option.stateName
            })}
            value={state.find((s) => s._id === formData.stateId) || null}
            onChange={(_, newValue) => {
                setFormData((prev) => ({
                ...prev,
                stateId: newValue?._id || "",
                }));
                if (errors.stateId) {
                setErrors((prev) => ({ ...prev, stateId: "" }));
                }
            }}
            renderInput={(params) => (
                <TextField
                {...params}
                label="State"
                error={!!errors.stateId}
                  helperText={typeof errors.stateId === "string" ? errors.stateId : ""}
            />
            )}
            sx={{ flex: 1 }}
            slotProps={{
              popper: {
                sx: { zIndex: dialogZIndex || 1500 }
              }
            }}
            />
          <Tooltip title="Add New State">
            <IconButton
              onClick={handleAddState}
              size="small"
              sx={{ color: 'primary.main', width: 40, height: 40 }}
            >
              <Plus size={18} />
            </IconButton>
          </Tooltip>
        </Box>
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
          disabled={isLoading || !formData.cityName || !formData.stateId}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? "Processing..." : cityData?._id ? "Update" : "Save"}
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
