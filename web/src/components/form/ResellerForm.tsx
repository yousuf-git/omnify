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
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createResource, updateResource, getResources } from "../../api/api";
import type { Reseller } from "../../api/types";
import { useNestedEntity } from "../../contexts/NestedEntityContext";

interface ResellerFormData {
  _id?: string;
  resellerName: string;
  address: string;
  gstn: string;
  shippingAddress: string;
  cityId: string;
  stateId: string;
  inActive?: boolean;
}

interface ResellerFormProps {
  resellerData?: Reseller | null;
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

export default function ResellerForm({
  resellerData,
  onSuccess,
  dialogZIndex,
}: ResellerFormProps) {
  const { openDialog, registerRefreshCallback, unregisterRefreshCallback } = useNestedEntity();
  const [formData, setFormData] = useState<ResellerFormData>({
    resellerName: "",
    address: "",
    gstn: "",
    shippingAddress: "",
    cityId: "",
    stateId: "",
    inActive: false,
  });

  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [errors, setErrors] = useState<Partial<ResellerFormData>>({});
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
    if (resellerData) {
      setFormData({
        _id: resellerData._id,
        resellerName: resellerData.resellerName,
        address: resellerData.address,
        gstn: resellerData.gstn,
        shippingAddress: resellerData.shippingAddress,
        cityId:
          typeof resellerData.cityId === "object"
            ? (resellerData.cityId as any)._id
            : resellerData.cityId,
        stateId:
          typeof resellerData.stateId === "object"
            ? (resellerData.stateId as any)._id
            : resellerData.stateId,
        inActive: !resellerData.isActive,
      });
    }
  }, [resellerData]);

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
    if (errors[name as keyof ResellerFormData]) {
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
    const newErrors: Partial<ResellerFormData> = {};

    if (!formData.resellerName.trim()) {
      newErrors.resellerName = "Reseller name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    // if (!formData.gstn.trim()) {
    //   newErrors.gstn = "GSTN is required";
    // } else if (
    //   !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    //     formData.gstn
    //   )
    // ) {
    //   newErrors.gstn = "Invalid GST format (e.g., 22AAAAA0000A1Z5)";
    // }

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
        resellerName: formData.resellerName,
        address: formData.address,
        gstn: formData.gstn,
        shippingAddress: formData.shippingAddress,
        cityId: formData.cityId,
        stateId: formData.stateId,
        isActive: !formData.inActive,
      };

      if (formData._id) {
        await updateResource("/resellers", formData._id, payload);
        showSnackbar("Reseller updated successfully!", "success");
      } else {
        await createResource("/resellers", payload);
        showSnackbar("Reseller created successfully!", "success");
      }

      // Reset form after successful submission if not in edit mode
      if (!resellerData?._id) {
        setFormData({
          resellerName: "",
          address: "",
          gstn: "",
          shippingAddress: "",
          cityId: "",
          stateId: "",
          inActive: false,
        });
      }

      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate("/ResellerPage"), 1000);
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
          <IconButton onClick={() => navigate("/ResellerPage")} size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
            <ArrowBack fontSize="small" />
          </IconButton>
        )}
        <Box>
          <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>
            {resellerData?._id ? "Edit reseller" : "New reseller"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {resellerData?._id
              ? "Update the reseller details below."
              : "Add a new reseller to your directory."}
          </Typography>
        </Box>
      </Box>

      <Box className="flex flex-col gap-4">
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

          <Box className="flex flex-col gap-4" sx={{ mt: 1 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, alignItems: "flex-start" }}>
          {/* Reseller Name */}
          <TextField
            fullWidth
            id="resellerName"
            name="resellerName"
            label="Reseller Name*"
            variant="outlined"
            value={formData.resellerName}
            onChange={handleInputChange}
            size="small"
            error={!!errors.resellerName}
            helperText={errors.resellerName}
            required
            disabled={isLoading}
          />

          {/* Address */}
          <TextField
            fullWidth
            id="address"
            name="address"
            label="Address"
            variant="outlined"
            value={formData.address}
            onChange={handleInputChange}
            size="small"
            multiline
            disabled={isLoading}
          />
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, alignItems: "flex-start" }}>
          {/* GSTN */}
          <TextField
            fullWidth
            id="gstn"
            name="gstn"
            label="GSTN*"
            variant="outlined"
            value={formData.gstn}
            onChange={handleInputChange}
            size="small"
            error={!!errors.gstn}
            helperText={errors.gstn}
            required
            disabled={isLoading}
          />

          {/* Shipping Address */}
          <TextField
            fullWidth
            id="shippingAddress"
            name="shippingAddress"
            label="Shipping Address"
            variant="outlined"
            value={formData.shippingAddress}
            onChange={handleInputChange}
            size="small"
            multiline
            disabled={isLoading}
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
              value={cities.find(city => city._id === formData.cityId) || null}
              onChange={(_, newValue) => {
                if (newValue) {
                  handleCityChange(newValue._id);
                } else {
                  setFormData(prev => ({ ...prev, cityId: "" }));
                }
              }}
              loading={loadingCitiesStates}
              disabled={!formData.stateId}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City *"
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
            onClick={() => (onSuccess ? onSuccess() : navigate("/ResellerPage"))}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={
              isLoading ||
              !formData.resellerName ||
              !formData.gstn ||
              !formData.cityId ||
              !formData.stateId
            }
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading
              ? "Processing..."
              : resellerData?._id
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