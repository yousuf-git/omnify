import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  IconButton,
  type SelectChangeEvent,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createResource, getResources, updateResource } from "../../api/api";
import type { Item, ItemStockRecord } from "../../api/types";

interface StockRecordFormData {
  _id?: string;
  itemId: string;
  itemName: string;
  openingStock: number;
  closingStock: number;
  remainingStock: number;
}

interface StockRecordFormProps {
  itemStockRecordData?: ItemStockRecord | null;
  onSuccess?: () => void;
}

export default function ItemStockRecordForm({
  itemStockRecordData,
  onSuccess,
}: StockRecordFormProps) {
  const [formData, setFormData] = useState<StockRecordFormData>({
    itemId: "",
    itemName: "",
    openingStock: 0,
    closingStock: 0,
    remainingStock: 0,
  });

  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<StockRecordFormData>>({});
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
      navigate(-1);
    }
  };

  // Load items for dropdown
  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        const response = await getResources("/items");
        setItems(Array.isArray(response) ? response : []);
      } catch (err:any) {
        console.error("Error loading items:", err);
        showSnackbar(`Error: ${err.message}`, "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, []);

  // Initialize form data if editing
  useEffect(() => {
    if (itemStockRecordData) {
      const selectedItem = items.find(
        (item) => item._id === itemStockRecordData.itemId
      );

      setFormData({
        _id: itemStockRecordData._id,
        itemId: itemStockRecordData.itemId,
        itemName: selectedItem?.itemName || "",
        openingStock: itemStockRecordData.openingStock,
        closingStock: itemStockRecordData.closingStock,
        remainingStock: itemStockRecordData.remainingStock,
      });
    }
  }, [itemStockRecordData, items]);

  // Calculate remaining stock when opening stock changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      remainingStock: Number(prev.openingStock) - Number(prev.closingStock),
    }));
  }, [formData.openingStock, formData.closingStock]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name as keyof StockRecordFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleItemSelect = (e: SelectChangeEvent<string>) => {
    const itemId = e.target.value;
    const selectedItem = items.find((item) => item._id === itemId);

    setFormData((prev) => ({
      ...prev,
      itemId,
      itemName: selectedItem?.itemName || "",
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StockRecordFormData> = {};

    if (!formData.itemId) newErrors.itemId = "Item selection is required";
    if (formData.openingStock < 0) newErrors.openingStock = 0;
    if (formData.closingStock < 0) newErrors.closingStock = 0;
    if (formData.remainingStock < 0) {
      newErrors.remainingStock = 0;
      showSnackbar("Closing stock cannot exceed opening stock", "error");
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
        itemId: formData.itemId,
        openingStock: Number(formData.openingStock),
        closingStock: Number(formData.closingStock),
        remainingStock: Number(formData.remainingStock),
      };

      if (formData._id) {
        // Update existing record
        await updateResource("/item-stock-records", formData._id, payload);
        showSnackbar("Stock record updated successfully!", "success");
      } else {
        // Create new record
        await createResource("/item-stock-records", payload);
        showSnackbar("Stock record created successfully!", "success");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate("/ItemStockRecordPage"), 1000);
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
            {formData._id ? "Edit stock record" : "New stock record"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Set opening, closing & remaining stock for an item.
          </Typography>
        </Box>
      </Box>

      <Box className="flex flex-col gap-4">
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>Details</Typography>

          <Box className="flex flex-col gap-4" sx={{ mt: 1 }}>
            {/* Item Selection */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              <FormControl fullWidth size="small" error={!!errors.itemId}>
                <InputLabel>Item *</InputLabel>
                <Select
                  name="itemId"
                  value={formData.itemId}
                  label="Item *"
                  onChange={handleItemSelect}
                  required
                  disabled={!!formData._id} // Disable if editing
                >
                  {items.map((item) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.itemName} ({item.modelNoSKU})
                    </MenuItem>
                  ))}
                </Select>
                {errors.itemId && (
                  <Typography variant="caption" color="error">
                    {errors.itemId}
                  </Typography>
                )}
              </FormControl>

              <TextField
                fullWidth
                label="Opening Stock"
                name="openingStock"
                type="number"
                value={formData.openingStock}
                onChange={handleInputChange}
                size="small"
                required
                error={!!errors.openingStock}
                helperText={errors.openingStock}
                inputProps={{ min: 0 }}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              <TextField
                fullWidth
                label="Closing Stock"
                name="closingStock"
                type="number"
                value={formData.closingStock}
                onChange={handleInputChange}
                size="small"
                error={!!errors.closingStock}
                helperText={errors.closingStock}
                inputProps={{ min: 0, max: formData.openingStock }}
              />

              <TextField
                fullWidth
                label="Remaining Stock"
                name="remainingStock"
                type="number"
                value={formData.remainingStock}
                onChange={handleInputChange}
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ "& .MuiInputBase-root": { bgcolor: "action.hover" } }}
                error={!!errors.remainingStock}
                helperText={errors.remainingStock}
              />
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
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? "Processing..." : formData._id ? "Update" : "Save"}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
