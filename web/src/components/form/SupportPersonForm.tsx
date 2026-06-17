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
import { createResource, getResources, updateResource } from "../../api/api";
import type { Agency, SupportPerson } from "../../api/types";
import { useNestedEntity } from "../../contexts/NestedEntityContext";

interface SupportPersonFormData {
  _id?: string;
  supportPersonId?: string;
  agencyId?: string;
  supportPersonName: string;
  supportPersonNumber: string;
  cityId: string;
  stateId: string;

  isActive?: boolean;
}

interface SupportPersonFormProps {
  supportPersonData?: SupportPerson | null;
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

const SupportPersonForm: React.FC<SupportPersonFormProps> = ({
  supportPersonData,
  onSuccess,
  dialogZIndex,
}) => {
  const { openDialog, registerRefreshCallback, unregisterRefreshCallback } = useNestedEntity();
  const [supportPersonFormData, setSupportPersonFormData] =
    React.useState<SupportPersonFormData>({
      supportPersonName: "",
      supportPersonNumber: "",
      cityId: "",
      stateId: "",
      
      isActive: true,
    });

  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [errors, setErrors] = React.useState<Partial<SupportPersonFormData>>(
    {}
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const [citiesStatesLoading, setCitiesStatesLoading] = useState(true);
  const [agenciesError, setAgenciesError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadAgencies = async () => {
    try {
      setAgenciesLoading(true);
      setAgenciesError(null);
      const response = await getResources("/agency");
      setAgencies(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error loading agencies:", err);
      setAgenciesError(
        err instanceof Error ? err.message : "Failed to load agencies"
      );
      setAgencies([]);
    } finally {
      setAgenciesLoading(false);
    }
  };

  const loadCitiesAndStates = async () => {
    try {
      setCitiesStatesLoading(true);
      const citiesData = await getResources("/cities?showInactive=true");
      const statesData = await getResources("/states?showInactive=true");
      setCities(Array.isArray(citiesData) ? citiesData : []);
      setStates(Array.isArray(statesData) ? statesData : []);
    } catch (err) {
      console.error("Error loading cities and states:", err);
    } finally {
      setCitiesStatesLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
    loadCitiesAndStates();
  }, []);

  // Register refresh callbacks for nested entity creation
  useEffect(() => {
    registerRefreshCallback('agencies', loadAgencies);
    registerRefreshCallback('cities', loadCitiesAndStates);
    
    return () => {
      unregisterRefreshCallback('agencies');
      unregisterRefreshCallback('cities');
    };
  }, [registerRefreshCallback, unregisterRefreshCallback]);

  // Handlers for adding new entities
  const handleAddAgency = () => {
    openDialog('agency', loadAgencies);
  };

  const handleAddCity = () => {
    openDialog('city', loadCitiesAndStates);
  };

  // Set form data if in edit mode
  useEffect(() => {
    if (supportPersonData) {
      setSupportPersonFormData({
        ...supportPersonData,
        cityId:
          typeof supportPersonData.cityId === "object"
            ? (supportPersonData.cityId as any)._id
            : supportPersonData.cityId,
        stateId:
          typeof supportPersonData.stateId === "object"
            ? (supportPersonData.stateId as any)._id
            : supportPersonData.stateId,
        agencyId:
          typeof supportPersonData.agencyId === "object"
            ? (supportPersonData.agencyId as any)._id
            : supportPersonData.agencyId,
      });
    }
  }, [supportPersonData]);

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
    setSupportPersonFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof SupportPersonFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle state selection change - clears city and agency when state changes
  const handleStateChange = (stateId: string) => {
    setSupportPersonFormData((prev) => ({
      ...prev,
      stateId,
      cityId: "", // Clear city when state changes
      agencyId: "", // Clear agency when state changes
    }));
    
    // Clear errors
    if (errors.stateId) {
      setErrors((prev) => ({ ...prev, stateId: "" }));
    }
  };

  // Handle city selection change
  const handleCityChange = (cityId: string) => {
    setSupportPersonFormData((prev) => ({
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

  // Helper to get state ID from agency
  const getStateIdFromAgency = (agency: Agency): string => {
    if (typeof agency.stateId === 'object' && agency.stateId !== null) {
      return (agency.stateId as any)._id;
    }
    return agency.stateId as string;
  };

  // Filter cities by selected state
  const filteredCities = supportPersonFormData.stateId
    ? cities.filter(city => getStateIdFromCity(city) === supportPersonFormData.stateId)
    : [];

  // Filter agencies by selected state
  const filteredAgencies = supportPersonFormData.stateId
    ? agencies.filter(agency => getStateIdFromAgency(agency) === supportPersonFormData.stateId)
    : [];

  const validateForm = (): boolean => {
    const newErrors: Partial<SupportPersonFormData> = {};
    if (!supportPersonFormData.supportPersonName) {
      newErrors.supportPersonName = "Support Person name is required";
    }
    if (!supportPersonFormData.supportPersonNumber) {
      newErrors.supportPersonNumber = "Support Person number is required";
    }
    if (!supportPersonFormData.agencyId) {
      newErrors.agencyId = "Agency is required";
    }
    if (!supportPersonFormData.cityId) {
      newErrors.cityId = "City is required";
    }
    if (!supportPersonFormData.stateId) {
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
        supportPersonName: supportPersonFormData.supportPersonName,
        supportPersonNumber: supportPersonFormData.supportPersonNumber,
        agencyId: supportPersonFormData.agencyId,
        cityId: supportPersonFormData.cityId,
        stateId: supportPersonFormData.stateId,
        
        isActive: supportPersonFormData.isActive,
      };

      if (supportPersonFormData._id) {
        await updateResource(
          "/support-person",
          supportPersonFormData._id,
          payload
        );
        showSnackbar("Support Person updated successfully!", "success");
      } else {
        await createResource("/support-person", payload);
        showSnackbar("Support Person created successfully!", "success");
      }

      if (!supportPersonData?._id) {
        setSupportPersonFormData({
          supportPersonName: "",
          supportPersonNumber: "",
          cityId: "",
          stateId: "",
          
          isActive: true,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate("/SupportPersonPage"), 1000);
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
        {!onSuccess && (
          <IconButton onClick={() => navigate("/SupportPersonPage")} size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
            <ArrowBack fontSize="small" />
          </IconButton>
        )}
        <Box>
          <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>
            {supportPersonData?._id ? "Edit support person" : "New support person"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {supportPersonData?._id
              ? "Update the support person details below."
              : "Add a new support person to your directory."}
          </Typography>
        </Box>
      </Box>

      <Box className="flex flex-col gap-4">
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

          <Box className="flex flex-col gap-4" sx={{ mt: 1 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TextField
            label="Support Person Name"
            name="supportPersonName"
            value={supportPersonFormData.supportPersonName}
            onChange={handleInputChange}
            error={!!errors.supportPersonName}
            helperText={errors.supportPersonName}
            fullWidth
            size="small"
          />

          <TextField
            label="Support Person Number"
            name="supportPersonNumber"
            value={supportPersonFormData.supportPersonNumber}
            onChange={handleInputChange}
            error={!!errors.supportPersonNumber}
            helperText={errors.supportPersonNumber}
            fullWidth
            size="small"
          />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, alignItems: "flex-start" }}>
          {/* State Selection with Autocomplete - Select first */}
          <Autocomplete
            fullWidth
            options={[...states].sort((a, b) => a.stateName.localeCompare(b.stateName))}
            getOptionLabel={(option) => option.stateName || ""}
            filterOptions={createFilterOptions({
              matchFrom: 'any',
              stringify: (option: typeof states[0]) => option.stateName || ''
            })}
            value={states.find(state => state._id === supportPersonFormData.stateId) || null}
            onChange={(_, newValue) => {
              if (newValue) {
                handleStateChange(newValue._id);
              } else {
                setSupportPersonFormData(prev => ({ ...prev, stateId: "", cityId: "", agencyId: "" }));
              }
            }}
            loading={citiesStatesLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="State *"
                size="small"
                required
                error={!!errors.stateId}
                helperText={errors.stateId}
              />
            )}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            slotProps={{
              popper: {
                sx: { zIndex: dialogZIndex || 1500 }
              }
            }}
          />

          {/* City Selection with Autocomplete and Add Button - Filtered by state */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, width: '100%' }}>
            <Autocomplete
              fullWidth
              options={[...filteredCities].sort((a, b) => 
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              )}
              getOptionLabel={(option) => option.cityName || ""}
              filterOptions={createFilterOptions({
                matchFrom: 'any',
                stringify: (option: typeof cities[0]) => option.cityName || ''
              })}
              value={cities.find(city => city._id === supportPersonFormData.cityId) || null}
              onChange={(_, newValue) => {
                if (newValue) {
                  handleCityChange(newValue._id);
                } else {
                  setSupportPersonFormData(prev => ({ ...prev, cityId: "" }));
                }
              }}
              loading={citiesStatesLoading}
              disabled={!supportPersonFormData.stateId}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City *"
                  size="small"
                  required
                  error={!!errors.cityId}
                  helperText={!supportPersonFormData.stateId ? "Select state first" : errors.cityId}
                />
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
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
                disabled={!supportPersonFormData.stateId}
                sx={{
                  bgcolor: supportPersonFormData.stateId ? 'primary.main' : 'grey.400',
                  color: 'white',
                  '&:hover': { bgcolor: supportPersonFormData.stateId ? 'primary.dark' : 'grey.500' },
                  width: 40,
                  height: 40,
                }}
              >
                <Plus size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, alignItems: "flex-start" }}>
          {/* Agency Selection with Add Button - Filtered by state */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, width: '100%' }}>
            <Autocomplete
              fullWidth
              options={[...filteredAgencies].sort((a, b) =>
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              )}
              getOptionLabel={(option) => option.agencyName || ""}
              filterOptions={createFilterOptions({
                matchFrom: 'any',
                stringify: (option: Agency) => option.agencyName || ''
              })}
              value={agencies.find(agency => agency._id === supportPersonFormData.agencyId) || null}
              onChange={(_, newValue) => {
                setSupportPersonFormData(prev => ({
                  ...prev,
                  agencyId: newValue?._id || "",
                }));
                if (errors.agencyId) {
                  setErrors(prev => ({ ...prev, agencyId: "" }));
                }
              }}
              loading={agenciesLoading}
              disabled={!supportPersonFormData.stateId || agenciesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Agency *"
                  size="small"
                  required
                  error={!!errors.agencyId}
                  helperText={!supportPersonFormData.stateId ? "Select state first" : errors.agencyId}
                />
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              slotProps={{
                popper: {
                  sx: { zIndex: dialogZIndex || 1500 }
                }
              }}
            />
            <Tooltip title="Add New Agency">
              <IconButton
                onClick={handleAddAgency}
                size="small"
                disabled={!supportPersonFormData.stateId}
                sx={{
                  bgcolor: supportPersonFormData.stateId ? 'primary.main' : 'grey.400',
                  color: 'white',
                  '&:hover': { bgcolor: supportPersonFormData.stateId ? 'primary.dark' : 'grey.500' },
                  width: 40,
                  height: 40,
                }}
              >
                <Plus size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={supportPersonFormData.isActive}
                onChange={(e) =>
                  setSupportPersonFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                disabled={isLoading}
              />
            }
            label="Status"
          />
          <Chip
            label={supportPersonFormData.isActive ? "Active" : "Inactive"}
            color={supportPersonFormData.isActive ? "success" : "error"}
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
            onClick={() => (onSuccess ? onSuccess() : navigate("/SupportPersonPage"))}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={
              isLoading ||
              !supportPersonFormData.supportPersonName ||
              !supportPersonFormData.supportPersonNumber ||
              !supportPersonFormData.agencyId ||
              !supportPersonFormData.cityId ||
              !supportPersonFormData.stateId
            }
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading
              ? "Processing..."
              : supportPersonFormData._id
              ? "Update"
              : "Save"}
          </Button>
        </Box>
      </Box>

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
};

export default SupportPersonForm;