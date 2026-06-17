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
import { ArrowBack } from "@mui/icons-material";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Agency } from "../../api/types";
import { createResource, updateResource, getResources } from "../../api/api";
import { useNestedEntity } from "../../contexts/NestedEntityContext";

interface AgencyFormData {
  _id?: string;
  agencyName: string;
  agencyNumber: string;
  cityId: string;
  stateId: string;
  inActive: boolean;
}

interface AgencyFormProps {
  agencyData?: Agency | null;
  onSuccess?: () => void;
  dialogZIndex?: number;
}

interface City {
  _id: string;
  cityName: string;
  stateId: string | { _id: string; stateName: string };
  createdAt?: string;
}

interface State {
  _id: string;
  stateName: string;
}

export default function AgencyForm({
  agencyData,
  onSuccess,
  dialogZIndex,
}: AgencyFormProps) {
  const { openDialog, registerRefreshCallback, unregisterRefreshCallback } = useNestedEntity();
  const [formData, setFormData] = useState<AgencyFormData>({
    agencyName: "",
    agencyNumber: "",
    cityId: "",
    stateId: "",
    inActive: false,
  });

  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [errors, setErrors] = useState<Partial<AgencyFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCitiesStates, setLoadingCitiesStates] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const navigate = useNavigate();

  // Refresh function for nested entity creation
  const refreshCitiesAndStates = async () => {
    try {
      setLoadingCitiesStates(true);
      const response = await getResources("/cities?showInactive=true");
      const statesResponse = await getResources("/states?showInactive=true");
      setCities(Array.isArray(response) ? response : []);
      setStates(Array.isArray(statesResponse) ? statesResponse : []);
    } catch (err:any) {
      console.error("Error loading cities and states:", err);
    } finally {
      setLoadingCitiesStates(false);
    }
  };
  // Load cities and states
  useEffect(() => {
    refreshCitiesAndStates();
  }, []);

  // Register refresh callbacks for nested entity creation
  useEffect(() => {
    registerRefreshCallback('cities', refreshCitiesAndStates);
    
    return () => {
      unregisterRefreshCallback('cities');
    };
  }, [registerRefreshCallback, unregisterRefreshCallback]);

  // Handler for adding new city
  const handleAddCity = () => {
    openDialog('city', refreshCitiesAndStates);
  };

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (agencyData) {
      setFormData({
        _id: agencyData._id,
        agencyName: agencyData.agencyName,
        agencyNumber: agencyData.agencyNumber,
        cityId: typeof agencyData.cityId === 'object' 
          ? (agencyData.cityId as any)._id 
          : agencyData.cityId,
        stateId: typeof agencyData.stateId === 'object'
          ? (agencyData.stateId as any)._id
          : agencyData.stateId,
        inActive: !agencyData.isActive,
      });
    }
  }, [agencyData]);

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
    if (errors[name as keyof AgencyFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle state selection change - clears city when state changes
  const handleStateChange = (stateId: string) => {
    setFormData((prev) => ({
      ...prev,
      stateId,
      cityId: "", // Clear city when state changes
    }));
    
    // Clear errors
    if (errors.stateId) {
      setErrors((prev) => ({ ...prev, stateId: "" }));
    }
  };

  // Handle city selection change
  const handleCityChange = (cityId: string) => {
    setFormData((prev) => ({
      ...prev,
      cityId,
    }));
    
    // Clear error
    if (errors.cityId) {
      setErrors((prev) => ({ ...prev, cityId: "" }));
    }
  };

  // Helper to get state ID from city
  const getStateIdFromCity = (city: City): string => {
    return typeof city.stateId === 'object' ? city.stateId._id : city.stateId;
  };

  // Filter cities by selected state
  const filteredCities = formData.stateId
    ? cities.filter(city => getStateIdFromCity(city) === formData.stateId)
    : [];

  const validateForm = (): boolean => {
    const newErrors: Partial<AgencyFormData> = {};
    if (!formData.agencyName.trim()) {
      newErrors.agencyName = "Agency name is required";
    }
    if (!formData.agencyNumber.trim()) {
      newErrors.agencyNumber = "Agency number is required";
    }
    if (!formData.cityId) {
      newErrors.cityId = "City is required";
    }
    if (!formData.stateId) {
      newErrors.stateId = "State is required";
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
        agencyName: formData.agencyName,
        agencyNumber: formData.agencyNumber,
        cityId: formData.cityId,
        stateId: formData.stateId,
        isActive: !formData.inActive,
      };

      if (formData._id) {
        await updateResource("/agency", formData._id, payload);
      } else {
        await createResource("/agency", payload);
      }

      // Clear form only for new creations
      if (!formData._id) {
        setFormData({
          agencyName: "",
          agencyNumber: "",
          cityId: "",
          stateId: "",
          inActive: false,
        });
      }

      showSnackbar(
        `Agency ${formData._id ? "updated" : "created"} successfully!`,
        "success"
      );

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/AgencyPage");
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
          <IconButton onClick={() => navigate("/AgencyPage")} size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
            <ArrowBack fontSize="small" />
          </IconButton>
        )}
        <Box>
          <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>
            {agencyData?._id ? "Edit agency" : "New agency"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {agencyData?._id
              ? "Update the agency details below."
              : "Add a new agency to your directory."}
          </Typography>
        </Box>
      </Box>

      <Box className="flex flex-col gap-4">
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

          <Box className="flex flex-col gap-4" sx={{ mt: 1 }}>
        {/* Agency Name + Number */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TextField
            label="Agency Name"
            name="agencyName"
            value={formData.agencyName}
            onChange={handleInputChange}
            size="small"
            fullWidth
            required
            error={!!errors.agencyName}
            helperText={errors.agencyName}
            disabled={isLoading}
          />
          <TextField
            label="Agency Number"
            name="agencyNumber"
            value={formData.agencyNumber}
            onChange={handleInputChange}
            size="small"
            fullWidth
            required
            error={!!errors.agencyNumber}
            helperText={errors.agencyNumber}
            disabled={isLoading}
          />
        </Box>

        {/* State + City */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, alignItems: "flex-start" }}>
          <Autocomplete
            fullWidth
            options={[...states].sort((a, b) => a.stateName.localeCompare(b.stateName))}
            getOptionLabel={(option) => option.stateName || ""}
            filterOptions={createFilterOptions({
              matchFrom: 'any',
              stringify: (option: typeof states[0]) => option.stateName || ''
            })}
            value={states.find(state => state._id === formData.stateId) || null}
            onChange={(_, newValue) => {
              if (newValue) {
                handleStateChange(newValue._id);
              } else {
                setFormData(prev => ({ ...prev, stateId: "", cityId: "" }));
              }
            }}
            loading={loadingCitiesStates}
            renderInput={(params) => (
              <TextField
                {...params}
                label="State *"
                size="small"
                required
                error={!!errors.stateId}
                helperText={errors.stateId}
                disabled={isLoading || loadingCitiesStates}
              />
            )}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            slotProps={{
              popper: {
                sx: { zIndex: dialogZIndex || 1500 }
              }
            }}
          />

          {/* City Selection with Autocomplete - Filtered by state */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
            <Autocomplete
              options={[...filteredCities].sort((a, b) =>
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              )}
              getOptionLabel={(option) => option.cityName || ""}
              filterOptions={createFilterOptions({
                matchFrom: 'any',
                stringify: (option: typeof cities[0]) => option.cityName
              })}
              value={cities.find(city => city._id === formData.cityId) || null}
              onChange={(_, newValue) => {
                if (newValue) {
                  handleCityChange(newValue._id);
                } else {
                  setFormData(prev => ({ ...prev, cityId: "" }));
                }
              }}
              loading={loadingCitiesStates}
              disabled={!formData.stateId || isLoading || loadingCitiesStates}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City *"
                  size="small"
                  required
                  error={!!errors.cityId}
                  helperText={!formData.stateId ? "Select state first" : errors.cityId}
                  disabled={!formData.stateId || isLoading || loadingCitiesStates}
                />
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              sx={{ flex: 1 }}
              slotProps={{
                popper: {
                  sx: { zIndex: dialogZIndex || 1500 }
                }
              }}
            />
            <Tooltip title="Add New City">
              <IconButton
                onClick={handleAddCity}
                size="small"
                disabled={!formData.stateId}
                sx={{
                  color: formData.stateId ? 'primary.main' : 'grey.400',
                  width: 40,
                  height: 40,
                }}
              >
                <Plus size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Status Switch */}
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
        </Paper>

        {/* Form Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => (onSuccess ? onSuccess() : navigate("/AgencyPage"))}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={isLoading || !formData.agencyName.trim() || loadingCitiesStates}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading
              ? "Processing..."
              : agencyData?._id
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