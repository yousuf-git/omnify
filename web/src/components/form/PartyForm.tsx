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
import { createResource, getResources, updateResource } from "../../api/api";
import type { Party } from "../../api/types";
import { useNestedEntity } from "../../contexts/NestedEntityContext";

interface PartyFormData {
  _id?: string;
  partyId?: string;
  partyName: string;
  address: string;
  cityId: string;
  stateId: string;
  gstn: string;
  shippingAddress: string;
  inActive?: boolean;
  resellerId?: string;
}

interface Reseller {
  _id: string;
  resellerName: string;
  // Add other reseller fields if needed
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

interface PartyFormProps {
  partyData?: Party | null;
  onSuccess?: () => void;
  dialogZIndex?: number;
}

export default function PartyForm({ partyData, onSuccess, dialogZIndex }: PartyFormProps) {
  const { openDialog, registerRefreshCallback, unregisterRefreshCallback } = useNestedEntity();
  const [partyFormData, setPartyFormData] = React.useState<PartyFormData>({
    partyName: "",
    address: "",
    gstn: "",
    shippingAddress: "",
    inActive: false,
    resellerId: "",
    cityId: "",
    stateId: "",
  });

  const [errors, setErrors] = React.useState<Partial<PartyFormData>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [resellersLoading, setResellersLoading] = useState(false);
  const [resellersError, setResellersError] = useState<string | null>(null);
  const [loadingCitiesStates, setLoadingCitiesStates] = useState(true);
  const navigate = useNavigate();

  // Refresh functions for nested entity creation
  const refreshCitiesAndStates = async () => {
    try {
      setLoadingCitiesStates(true);
      const citiesResponse = await getResources("/cities?showInactive=true");
      const statesResponse = await getResources("/states?showInactive=true");
      setCities(Array.isArray(citiesResponse) ? citiesResponse : []);
      setStates(Array.isArray(statesResponse) ? statesResponse : []);
    } catch (err: any) {
      console.error("Error refreshing cities and states:", err);
    } finally {
      setLoadingCitiesStates(false);
    }
  };

  const refreshResellers = async () => {
    try {
      setResellersLoading(true);
      setResellersError(null);
      const response = await getResources("/resellers");
      setResellers(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error refreshing resellers:", err);
      setResellersError(
        err instanceof Error ? err.message : "Failed to load resellers"
      );
    } finally {
      setResellersLoading(false);
    }
  };

  // Load cities, states and resellers
  useEffect(() => {
    refreshCitiesAndStates();
    refreshResellers();
  }, []);

  // Register refresh callbacks for nested entity creation
  useEffect(() => {
    registerRefreshCallback('cities', refreshCitiesAndStates);
    registerRefreshCallback('resellers', refreshResellers);
    
    return () => {
      unregisterRefreshCallback('cities');
      unregisterRefreshCallback('resellers');
    };
  }, [registerRefreshCallback, unregisterRefreshCallback]);

  // Handlers for adding new entities
  const handleAddCity = () => {
    openDialog('city', refreshCitiesAndStates);
  };

  const handleAddReseller = () => {
    openDialog('reseller', refreshResellers);
  };

  useEffect(() => {
    if (partyData) {
      setPartyFormData({
        _id: partyData._id,
        partyId: partyData.partyId,
        partyName: partyData.partyName || "",
        address: partyData.address || "",
        gstn: partyData.gstn || "",
        shippingAddress: partyData.shippingAddress || "",
        inActive: !partyData.isActive,
        resellerId:
          typeof partyData.resellerId === "object"
            ? (partyData.resellerId as any)._id || ""
            : partyData.resellerId || "",
        cityId:
          typeof partyData.cityId === "object"
            ? (partyData.cityId as any)._id || ""
            : partyData.cityId || "",
        stateId:
          typeof partyData.stateId === "object"
            ? (partyData.stateId as any)._id || ""
            : partyData.stateId || "",
      });
    }
  }, [partyData]);

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
    setPartyFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name as keyof PartyFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setPartyFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle state selection change - clears city when state changes
  const handleStateChange = (stateId: string) => {
    setPartyFormData((prev) => ({
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
    setPartyFormData((prev) => ({
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
  const filteredCities = partyFormData.stateId
    ? cities.filter(city => getStateIdFromCity(city) === partyFormData.stateId)
    : [];

  const validateForm = (): boolean => {
    const newErrors: Partial<PartyFormData> = {};
    if (!partyFormData.partyName.trim())
      newErrors.partyName = "Party name is required";
    if (!partyFormData.address.trim())
      newErrors.address = "Address is required";
    if (!partyFormData.gstn.trim()) newErrors.gstn = "GSTN is required";
    // if (!partyFormData.resellerId)
    //   newErrors.resellerId = "Reseller is required";
    if (!partyFormData.cityId) newErrors.cityId = "City is required";
    if (!partyFormData.stateId) newErrors.stateId = "State is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        partyName: partyFormData.partyName,
        address: partyFormData.address,
        gstn: partyFormData.gstn,
        shippingAddress: partyFormData.shippingAddress,
        resellerId: partyFormData.resellerId || null,
        cityId: partyFormData.cityId,
        stateId: partyFormData.stateId,
        isActive: !partyFormData.inActive,
      };

      if (partyFormData._id) {
        // Update existing party
        await updateResource("/parties", partyFormData._id, payload);
        showSnackbar("Party updated successfully!", "success");
      } else {
        // Create new party
        await createResource("/parties", payload);
        showSnackbar("Party created successfully!", "success");
      }

      // Reset form after successful submission if not in edit mode
      if (!partyData?._id) {
        setPartyFormData({
          partyName: "",
          address: "",
          gstn: "",
          shippingAddress: "",
          resellerId: "",
          cityId: "",
          stateId: "",
          inActive: false,
        });
      }

      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior - navigate to parties page
        setTimeout(() => navigate("/PartyPage"), 1000);
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
          <IconButton onClick={() => navigate("/PartyPage")} size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
            <ArrowBack fontSize="small" />
          </IconButton>
        )}
        <Box>
          <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>
            {partyData?._id ? "Edit party" : "New party"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {partyData?._id
              ? "Update the party details below."
              : "Add a new party to your directory."}
          </Typography>
        </Box>
      </Box>

      <Box className="flex flex-col gap-4">
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

          <Box className="flex flex-col gap-4" sx={{ mt: 1 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TextField
            id="partyName"
            name="partyName"
            label="Party Name"
            variant="outlined"
            value={partyFormData.partyName}
            onChange={handleInputChange}
            size="small"
            className="w-full"
            error={!!errors.partyName}
            helperText={errors.partyName}
            required
            disabled={isLoading}
          />

          <TextField
            id="gstn"
            name="gstn"
            label="GSTN"
            variant="outlined"
            value={partyFormData.gstn}
            onChange={handleInputChange}
            size="small"
            className="w-full"
            error={!!errors.gstn}
            helperText={errors.gstn}
            required
            disabled={isLoading}
          />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>

          {/* State Selection with Autocomplete - Select first */}
          <Autocomplete
            fullWidth
            options={[...states].sort((a, b) => a.stateName.localeCompare(b.stateName))}
            getOptionLabel={(option) => option.stateName || ""}
            filterOptions={createFilterOptions({
              matchFrom: 'any',
              stringify: (option: typeof states[0]) => option.stateName || ''
            })}
            value={states.find(state => state._id === partyFormData.stateId) || null}
            onChange={(_, newValue) => {
              if (newValue) {
                handleStateChange(newValue._id);
              } else {
                setPartyFormData(prev => ({ ...prev, stateId: "", cityId: "" }));
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
              value={cities.find(city => city._id === partyFormData.cityId) || null}
              onChange={(_, newValue) => {
                if (newValue) {
                  handleCityChange(newValue._id);
                } else {
                  setPartyFormData(prev => ({ ...prev, cityId: "" }));
                }
              }}
              loading={loadingCitiesStates}
              disabled={!partyFormData.stateId}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City *"
                  size="small"
                  required
                  error={!!errors.cityId}
                  helperText={!partyFormData.stateId ? "Select state first" : errors.cityId}
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
                disabled={!partyFormData.stateId}
                sx={{
                  bgcolor: partyFormData.stateId ? 'primary.main' : 'grey.400',
                  color: 'white',
                  '&:hover': { bgcolor: partyFormData.stateId ? 'primary.dark' : 'grey.500' },
                  width: 40,
                  height: 40,
                }}
              >
                <Plus size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box className="flex flex-col gap-4">
          <TextField
            id="address"
            name="address"
            label="Address"
            variant="outlined"
            value={partyFormData.address}
            onChange={handleInputChange}
            size="small"
            className="w-full"
            error={!!errors.address}
            helperText={errors.address}
            required
            disabled={isLoading}
            multiline
            rows={3}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, alignItems: "flex-start" }}>
            <TextField
              id="shippingAddress"
              name="shippingAddress"
              label="Shipping Address"
              variant="outlined"
              value={partyFormData.shippingAddress}
              onChange={handleInputChange}
              size="small"
              className="w-full"
              disabled={isLoading}
            />

            {/* Reseller Selection with Add Button */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, width: '100%' }}>
              <Autocomplete
                fullWidth
                options={resellers}
                getOptionLabel={(option) => option.resellerName || ""}
                value={
                  resellers.find((r) => r._id === partyFormData.resellerId) || null
                }
                onChange={(_, newValue) =>
                  setPartyFormData((prev) => ({
                    ...prev,
                    resellerId: newValue ? newValue._id : "",
                  }))
                }
                loading={resellersLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Reseller *"
                    size="small"
                    // required
                    error={!!errors.resellerId}
                    helperText={errors.resellerId || resellersError || ""}
                  />
                )}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                slotProps={{
                  popper: {
                    sx: { zIndex: dialogZIndex || 1500 }
                  }
                }}
              />
              <Tooltip title="Add New Reseller">
                <IconButton
                  onClick={handleAddReseller}
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
          </Box>
        </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!partyFormData.inActive}
                  onChange={(e) =>
                    setPartyFormData((prev) => ({
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
              label={partyFormData.inActive ? "Inactive" : "Active"}
              color={partyFormData.inActive ? "error" : "success"}
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
            onClick={() => (onSuccess ? onSuccess() : navigate("/PartyPage"))}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={
              isLoading ||
              !partyFormData.partyName ||
              !partyFormData.address ||
              !partyFormData.gstn ||
              // !partyFormData.resellerId ||
              !partyFormData.cityId ||
              !partyFormData.stateId
            }
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? "Processing..." : partyData?._id ? "Update" : "Save"}
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
}