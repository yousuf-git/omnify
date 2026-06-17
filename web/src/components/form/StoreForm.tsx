import {
  Box,
  Button,
  type SelectChangeEvent,
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
import type { Store, Party } from "../../api/types";
import { createResource, getResources, updateResource } from "../../api/api";
import { useNestedEntity } from "../../contexts/NestedEntityContext";

interface StoreFormProps {
  storeData?: Store | null;
  onSuccess?: () => void;
  dialogZIndex?: number;
}

interface StoreFormData {
  _id?: string;
  storeId?: number;
  storeName: string;
  storeAddress: string;
  storePinCode: string;
  partyId?: string;
  partyName?: string;
  smName: string;
  smContactNo: string;
  cityId: string;
  stateId: string;
  inActive?: boolean;
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

// Add this interface for error messages
interface StoreFormErrors {
  storeName?: string;
  storeAddress?: string;
  storePinCode?: string;
  partyId?: string;
  smName?: string;
  smContactNo?: string;
  cityId?: string;
  stateId?: string;
}

export default function StoreForm({ storeData, onSuccess, dialogZIndex }: StoreFormProps) {
  const { openDialog, registerRefreshCallback, unregisterRefreshCallback } = useNestedEntity();
  const [formData, setFormData] = useState<StoreFormData>({
    storeName: "",
    storeAddress: "",
    storePinCode: "",
    partyId: "",
    partyName: "",
    smName: "",
    smContactNo: "",
    cityId: "",
    stateId: "",
    inActive: false,
  });

  const [parties, setParties] = useState<Party[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [isLoadingParties, setIsLoadingParties] = useState(false);
  const [isLoadingCitiesStates, setIsLoadingCitiesStates] = useState(true);
  const [partiesError, setPartiesError] = useState("");

  // Fix: Use StoreFormErrors instead of Partial<Store>
  const [errors, setErrors] = useState<StoreFormErrors>({});

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
      navigate("/StorePage");
    }
  };

  // Refresh functions for nested entity creation
  const refreshParties = async () => {
    try {
      setIsLoadingParties(true);
      const partiesData = (await getResources("/parties")) as Party[];
      setParties(partiesData);
    } catch (error) {
      console.error("Error refreshing parties:", error);
    } finally {
      setIsLoadingParties(false);
    }
  };

  const refreshCitiesAndStates = async () => {
    try {
      setIsLoadingCitiesStates(true);
      const citiesData = await getResources("/cities?showInactive=true");
      const statesData = await getResources("/states?showInactive=true");
      setCities(Array.isArray(citiesData) ? citiesData : []);
      setStates(Array.isArray(statesData) ? statesData : []);
    } catch (error) {
      console.error("Error refreshing cities and states:", error);
    } finally {
      setIsLoadingCitiesStates(false);
    }
  };

  // Fetch parties, cities and states on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingParties(true);
      setIsLoadingCitiesStates(true);
      setPartiesError("");
      try {
        // Fetch parties
        const partiesData = (await getResources("/parties")) as Party[];
        setParties(partiesData);

        // Fetch cities and states
        const citiesData = await getResources("/cities?showInactive=true");
        const statesData = await getResources("/states?showInactive=true");
        setCities(Array.isArray(citiesData) ? citiesData : []);
        setStates(Array.isArray(statesData) ? statesData : []);
      } catch (error) {
        setPartiesError(
          error instanceof Error ? error.message : "Failed to load data"
        );
        showSnackbar("Failed to load data", "error");
      } finally {
        setIsLoadingParties(false);
        setIsLoadingCitiesStates(false);
      }
    };

    fetchData();
  }, []);

  // Register refresh callbacks for nested entity creation
  useEffect(() => {
    registerRefreshCallback('parties', refreshParties);
    registerRefreshCallback('cities', refreshCitiesAndStates);
    
    return () => {
      unregisterRefreshCallback('parties');
      unregisterRefreshCallback('cities');
    };
  }, [registerRefreshCallback, unregisterRefreshCallback]);

  // Handlers for adding new entities
  const handleAddParty = () => {
    openDialog('party', refreshParties);
  };

  const handleAddCity = () => {
    openDialog('city', refreshCitiesAndStates);
  };

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (storeData) {
      setFormData({
        _id: storeData._id,
        storeId: storeData.storeId,
        storeName: storeData.storeName,
        partyName: storeData.partyName,
        storeAddress: storeData.storeAddress,
        storePinCode: storeData.storePinCode,
        smName: storeData.smName,
        smContactNo: storeData.smContactNo,
        cityId:
          typeof storeData.cityId === "object"
            ? (storeData.cityId as any)._id
            : storeData.cityId,
        stateId:
          typeof storeData.stateId === "object"
            ? (storeData.stateId as any)._id
            : storeData.stateId,
        partyId:
          typeof storeData.partyId === "object"
            ? (storeData.partyId as any)._id
            : storeData.partyId,
        inActive: !storeData.isActive,
      });
    }
  }, [storeData]);

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
    if (errors[name as keyof StoreFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePartyChange = (e: SelectChangeEvent<string>) => {
    const partyId = e.target.value;
    const selectedParty = parties.find((party) => party._id === partyId);

    setFormData((prev) => ({
      ...prev,
      partyId,
      partyName: selectedParty?.partyName || "",
    }));

    // Clear error when user selects a party
    if (errors.partyId) {
      setErrors((prev) => ({ ...prev, partyId: "" }));
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

  // Fix: Use StoreFormErrors type
  const validateForm = (): boolean => {
    const newErrors: StoreFormErrors = {};
    if (!formData.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    }
    if (!formData.cityId) {
      newErrors.cityId = "City is required";
    }
    if (!formData.stateId) {
      newErrors.stateId = "State is required";
    }
    if (!formData.partyId) {
      newErrors.partyId = "Party selection is required";
    }
    // if (!formData.storeAddress.trim()) {
    //   newErrors.storeAddress = "Store address is required";
    // }
    // if (!formData.storePinCode.trim()) {
    //   newErrors.storePinCode = "Store pin code is required";
    // }
    // if (!formData.smName.trim()) {
    //   newErrors.smName = "SM name is required";
    // }
    // if (!formData.smContactNo.trim()) {
    //   newErrors.smContactNo = "SM contact number is required";
    // }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        storeId: formData.storeId,
        storeName: formData.storeName,
        storeAddress: formData.storeAddress,
        storePinCode: formData.storePinCode,
        partyId: formData.partyId,
        smName: formData.smName,
        smContactNo: formData.smContactNo,
        cityId: formData.cityId,
        stateId: formData.stateId,
        isActive: !formData.inActive,
      };
      if (formData._id) {
        // Update existing store
        await updateResource("/stores", formData._id, payload);
        showSnackbar("Store updated successfully!", "success");
      } else {
        // Create new store
        await createResource("/stores", payload);
        showSnackbar("Store created successfully!", "success");
      }

      // Reset form after successful submission if not in edit mode
      if (!storeData?._id) {
        setFormData({
          storeName: "",
          storeAddress: "",
          storePinCode: "",
          partyId: "",
          partyName: "",
          smName: "",
          smContactNo: "",
          cityId: "",
          stateId: "",
          inActive: false,
        });
      }

      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior - navigate to stores page
        setTimeout(() => navigate("/StorePage"), 1000);
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
            {storeData?._id ? "Edit store" : "New store"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {storeData?._id
              ? "Update the store details below."
              : "Add a new store location and its manager."}
          </Typography>
        </Box>
      </Box>

      <Box className="flex flex-col gap-4">
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

          <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 0, md: 4 }, alignItems: "start" }}>
            <Box className="w-full">
            {/* Store ID */}
            <TextField
              label="Store ID"
              name="storeId"
              value={formData.storeId}
              onChange={handleInputChange}
              fullWidth
              size="small"
              margin="normal"
            />

            {/* Store Name */}
            <TextField
              label="Store Name"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              size="small"
              error={!!errors.storeName}
              helperText={errors.storeName}
            />

            {/* Party Selection with Add Button - Converted to Autocomplete */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, width: '100%' }}>
              <Autocomplete
                fullWidth
                size="small"
                options={[...parties].sort((a, b) => 
                  new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                )}
                getOptionLabel={(option) => option.partyName || ""}
                filterOptions={createFilterOptions({
                  matchFrom: 'any',
                  stringify: (option: Party) => option.partyName || ''
                })}
                value={parties.find(party => party._id === formData.partyId) || null}
                onChange={(_, newValue) => {
                  const newPartyId = newValue?._id || "";
                  const selectedParty = parties.find(p => p._id === newPartyId);
                  setFormData(prev => ({
                    ...prev,
                    partyId: newPartyId,
                    partyName: selectedParty?.partyName || "",
                  }));
                  if (errors.partyId) {
                    setErrors(prev => ({ ...prev, partyId: "" }));
                  }
                }}
                loading={isLoadingParties}
                disabled={isLoadingParties}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Party *"
                    margin="normal"
                    required
                    error={!!errors.partyId}
                    helperText={errors.partyId}
                  />
                )}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                slotProps={{
                  popper: {
                    sx: { zIndex: dialogZIndex || 1500 }
                  }
                }}
              />
              <Tooltip title="Add New Party">
                <IconButton
                  onClick={handleAddParty}
                  size="small"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    width: 40,
                    height: 40,
                  }}
                >
                  <Plus size={18} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* State Selection with Autocomplete - Select first */}
            <Autocomplete
              fullWidth
              size="small"
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
              loading={isLoadingCitiesStates}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="State *"
                  margin="normal"
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
                  stringify: (option: City) => option.cityName
                })}
                value={cities.find(city => city._id === formData.cityId) || null}
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleCityChange(newValue._id);
                  } else {
                    setFormData(prev => ({ ...prev, cityId: "" }));
                  }
                }}
                loading={isLoadingCitiesStates}
                disabled={!formData.stateId}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="City *"
                    margin="normal"
                    size="small"
                    required
                    error={!!errors.cityId}
                    helperText={!formData.stateId ? "Select state first" : errors.cityId}
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
                  disabled={!formData.stateId}
                  sx={{
                    bgcolor: formData.stateId ? 'primary.main' : 'grey.400',
                    color: 'white',
                    '&:hover': { bgcolor: formData.stateId ? 'primary.dark' : 'grey.500' },
                    width: 40,
                    height: 40,
                  }}
                >
                  <Plus size={18} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box className="w-full">
            {/* Store Address */}
            <TextField
              label="Store Address"
              name="storeAddress"
              value={formData.storeAddress}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              size="small"
              error={!!errors.storeAddress}
              helperText={errors.storeAddress}
              multiline
              rows={2}
            />

            {/* Store Pin Code */}
            <TextField
              label="Store Pin Code"
              name="storePinCode"
              value={formData.storePinCode}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              size="small"
              error={!!errors.storePinCode}
              helperText={errors.storePinCode}
            />

            {/* SM Name */}
            <TextField
              label="SM Name"
              name="smName"
              value={formData.smName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              size="small"
              error={!!errors.smName}
              helperText={errors.smName}
            />

            {/* SM Contact No */}
            <TextField
              label="SM Contact No"
              name="smContactNo"
              value={formData.smContactNo}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              size="small"
              error={!!errors.smContactNo}
              helperText={errors.smContactNo}
            />
            {/* Status Switch */}
            <Box
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
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
            disabled={isLoading || isLoadingParties || isLoadingCitiesStates}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading
              ? "Processing..."
              : storeData?._id
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