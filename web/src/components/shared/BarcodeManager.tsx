import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Chip,
  Alert,
  Autocomplete,
  Paper,
  Snackbar,
} from "@mui/material";
import { Delete, Add, QrCodeScanner, Edit } from "@mui/icons-material";

// Define types
// Update the interface for barcode suggestions
interface BarcodeSuggestion {
  serialNo: string;
  _id: string;
  stockItemId: string; // MongoDB ID of the stock item
  isStockedOut?: boolean;

}
interface BarcodeManagerProps {
  open: boolean;
  onClose: () => void;
  itemName?: string;
  requiredQuantity: number;
  barcodes: string[];
  onBarcodesChange: (barcodes: string[]) => void;
  onBarcodeDelete?: (barcode: string, stockItemId: string) => Promise<void>;
  required?: boolean;
  isEdite?: boolean;
  mode?: "add" | "edit";
  stockInId?: string;
  stockOutId?: string;
  itemId?: string;
  operationType?: "stock-in" | "stock-out";
  validateBarcode?: (
    stockItemId: string
  ) => Promise<{ valid: boolean; message?: string }>;
  barcodeIdMap?: Record<string, string>;
  fetchAvailableBarcodes?: (itemId: string) => Promise<BarcodeSuggestion[]>;
  allowFreeEntry?: boolean; // Allow free text entry without validation (for non-serialized items)
}

export const BarcodeManager: React.FC<BarcodeManagerProps> = ({
  open,
  onClose,
  itemName = "Item",
  requiredQuantity,
  barcodes,
  isEdite = false,
  onBarcodesChange,
  onBarcodeDelete,
  required = false,
  mode = "add",
  stockInId,
  stockOutId,
  operationType = "stock-out",
  itemId,
  barcodeIdMap = {},
  fetchAvailableBarcodes,
  validateBarcode,
  allowFreeEntry = false,
}) => {
  const [currentBarcode, setCurrentBarcode] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [existingBarcodes, setExistingBarcodes] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<BarcodeSuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Update the state to track MongoDB IDs
  const [barcodeToStockItemMap, setBarcodeToStockItemMap] = useState<
    Record<string, BarcodeSuggestion>
  >({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });
  const showSnackbar = (
    message: string,
    severity: "success" | "warning" | "error"
  ) => {
    setSnackbar({ open: true, message, severity });
  };
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  // console.log("Rendering BarcodeManager with props:", filteredSuggestions);
  // Initialize existing barcodes when dialog opens
  useEffect(() => {
    if (open) {
      setExistingBarcodes(barcodes);
      setEditIndex(null);
      setCurrentBarcode("");
      loadAvailableBarcodes();
    }
  }, [open, barcodes]);

  // Load available barcodes for suggestions
  // Update the loadAvailableBarcodes function
  const loadAvailableBarcodes = async () => {
    if (!fetchAvailableBarcodes || !itemId) return;

    setLoading(true);
    try {
      const availableBarcodes = await fetchAvailableBarcodes(itemId);

      if (!availableBarcodes) {
        setSuggestions([]);
        setFilteredSuggestions([]);
        return;
      }

      // Create mapping of serial numbers to stock item data
      const newBarcodeMap: Record<string, BarcodeSuggestion> = {};
      availableBarcodes.forEach((barcode) => {
        if (barcode && barcode.serialNo) {
          newBarcodeMap[barcode.serialNo] = barcode;
        }
      });

      setBarcodeToStockItemMap(newBarcodeMap);
      setSuggestions(availableBarcodes);

      // Filter out already selected barcodes and stocked out items
      const availableSerialNos = availableBarcodes
        .filter(
          (s) =>
            s &&
            s.serialNo &&
            !existingBarcodes.includes(s.serialNo) &&
            !s.isStockedOut
        )
        .map((s) => s.serialNo);

      setFilteredSuggestions(availableSerialNos);
    } catch (error) {
      console.error("Failed to fetch available barcodes:", error);
      setSuggestions([]);
      setFilteredSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Update filtered suggestions when existingBarcodes changes
  useEffect(() => {
    const availableSerialNos = suggestions
      .filter((s) => s && s.serialNo && !existingBarcodes.includes(s.serialNo))
      .map((s) => s.serialNo);

    setFilteredSuggestions(availableSerialNos);
  }, [existingBarcodes, suggestions]);

  // Filter suggestions based on input text
  const getFilteredOptions = (options: string[], state: any) => {
    const inputValue = state.inputValue.toLowerCase().trim();
    if (!inputValue) return options;

    return options.filter((option) =>
      option.toLowerCase().includes(inputValue)
    );
  };

  // Update the handleAddBarcode function
  const handleAddBarcode = async (barcodeToAdd?: string) => {
    const barcode = barcodeToAdd || currentBarcode.trim();
    if (!barcode) return;

    // Check for duplicates in current list first
    if (existingBarcodes.includes(barcode)) {
      showSnackbar("Barcode already added", "warning");
      return;
    }

    // allowFreeEntry only works for stock-out (non-serialized items can enter any barcode)
    const skipValidation = allowFreeEntry && operationType === "stock-out";

    if (!skipValidation) {
      // Stock-In vs Stock-Out ke liye alag validation
      if (operationType === "stock-out") {
        // Stock-Out validation - barcode available stock mein hona chahiye
        const stockItemData = barcodeToStockItemMap[barcode];
        
        if (!stockItemData) {
          showSnackbar("Barcode not found in available stock", "error");
          return;
        }

        if (!stockItemData._id) {
          showSnackbar("Invalid stock item data", "error");
          return;
        }

        // Validate using MongoDB ID
        if (validateBarcode) {
          try {
            const validation = await validateBarcode(stockItemData._id);
            if (!validation.valid) {
              showSnackbar(`${validation.message}` || "Invalid barcode", "error");
              return;
            }
          } catch (error) {
            showSnackbar("Error validating barcode", "error");
            return;
          }
        }
      } else {
        // Stock-In validation - barcode unique hona chahiye (pehle se exist nahi karna chahiye)
        const stockItemData = barcodeToStockItemMap[barcode];
        
        if (stockItemData && !stockItemData.isStockedOut) {
          showSnackbar("Barcode already exists in stock", "error");
          return;
        }
      }
    }

    // Rest of the function remains same
    if (editIndex !== null) {
      const updatedBarcodes = [...existingBarcodes];
      updatedBarcodes[editIndex] = barcode;
      setExistingBarcodes(updatedBarcodes);
      setEditIndex(null);
    } else {
      if (existingBarcodes.length >= requiredQuantity) {
        showSnackbar(`Maximum ${requiredQuantity} barcodes allowed`, "warning");
        return;
      }
      setExistingBarcodes([...existingBarcodes, barcode]);
    }

    setCurrentBarcode('');
  };

  const handleEditBarcode = (index: number) => {
    setCurrentBarcode(existingBarcodes[index]);
    setEditIndex(index);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemoveBarcode = async (index: number) => {
    const barcodeToDelete = existingBarcodes[index];
    try {
      // Try to find stockItemId for backend deletion (if it exists)
      let stockItemId = barcodeIdMap[barcodeToDelete];

      // If not found in barcodeIdMap, try to find it in the barcodeToStockItemMap
      if (!stockItemId) {
        const stockItemData = barcodeToStockItemMap[barcodeToDelete];
        if (stockItemData) {
          stockItemId = stockItemData.stockItemId;
        }
      }

      // If we have both onBarcodeDelete callback and stockItemId, call backend deletion
      if (onBarcodeDelete && stockItemId) {
        try {
          await onBarcodeDelete(barcodeToDelete, stockItemId);
        } catch (error) {
          console.error("Error calling onBarcodeDelete:", error);
          // Continue with local deletion even if backend call fails
        }
      }

      // Always delete from local state (whether backend deletion succeeded or not)
      const newBarcodes = existingBarcodes.filter((_, i) => i !== index);
      setExistingBarcodes(newBarcodes);

      if (editIndex === index) {
        setEditIndex(null);
        setCurrentBarcode("");
      }

      showSnackbar("Barcode removed successfully!", "success");
    } catch (error) {
      console.error("Failed to delete barcode:", error);
      showSnackbar("Failed to delete barcode", "error");
    }
  };

  const handleSave = () => {
    onBarcodesChange(existingBarcodes);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddBarcode();
    }
  };

  const isComplete = existingBarcodes.length === requiredQuantity;
  const isValid = !required || isComplete;

  // Update the useEffect to include proper dependencies
  useEffect(() => {
    if (open && fetchAvailableBarcodes && itemId) {
      loadAvailableBarcodes();
    }
  }, [open, itemId]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { maxHeight: "80vh" } }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {mode === "edit" ? "Edit Barcodes" : "Barcode Management"}
            </Typography>
            <Chip
              label={`${existingBarcodes.length}/${requiredQuantity}`}
              color={isComplete ? "success" : required ? "warning" : "default"}
              size="small"
            />
          </Box>
          <Typography variant="subtitle2" color="text.secondary">
            {itemName} - Required: {requiredQuantity}
            {allowFreeEntry && operationType === "stock-out" && (
              <Typography component="span" color="info.main" sx={{ ml: 1 }}>
                (Barcodes are optional for this item)
              </Typography>
            )}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1.5, sm: 2 },
                mb: 2,
                alignItems: { xs: "stretch", sm: "flex-start" },
              }}
            >
              <Autocomplete
                freeSolo
                fullWidth
                options={filteredSuggestions}
                inputValue={currentBarcode}
                getOptionLabel={(option) => option}
                onInputChange={(event, newInputValue) => {
                  setCurrentBarcode(newInputValue);
                }}
                onChange={(event, newValue) => {
                  if (newValue) {
                    handleAddBarcode(newValue);
                  }
                }}
                filterOptions={(options, state) =>
                  getFilteredOptions(options, state)
                }
                // Add getOptionKey to ensure unique keys
                getOptionKey={(option) => {
                  const stockItemData = barcodeToStockItemMap[option];
                  return stockItemData?._id || option; // Use MongoDB ID if available, fallback to serial number
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputRef={inputRef}
                    label={
                      editIndex !== null
                        ? `Edit barcode ${editIndex + 1}`
                        : "Enter barcode"
                    }
                    size="small"
                    onKeyPress={handleKeyPress}
                    helperText={allowFreeEntry && operationType === "stock-out" ? "Enter any barcode (optional for non-serialized items)" : "Type or select from available barcodes"}
                  />
                )}
                PaperComponent={({ children }) => (
                  <Paper
                    sx={{
                      maxHeight: 200,
                      overflow: "auto",
                      boxShadow: 2,
                    }}
                  >
                    {children}
                  </Paper>
                )}
                loading={loading}
                loadingText="Loading available barcodes..."
                noOptionsText="No available barcodes found"
              />
              <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleAddBarcode(currentBarcode)}
                  disabled={!currentBarcode.trim()}
                  startIcon={editIndex !== null ? <Edit /> : <Add />}
                  sx={{ flex: { xs: 1, sm: "none" }, minWidth: 100 }}
                >
                  {editIndex !== null ? "Update" : "Add"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeScanner />}
                  disabled
                  sx={{ flex: { xs: 1, sm: "none" }, minWidth: 100 }}
                >
                  Scan
                </Button>
              </Box>
            </Box>

            {editIndex !== null && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Editing barcode #{editIndex + 1}. Click Update to save changes.
              </Alert>
            )}

            {!isValid && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {required
                  ? `Please add exactly ${requiredQuantity} barcodes`
                  : `You can add up to ${requiredQuantity} barcodes`}
              </Alert>
            )}
          </Box>

          {existingBarcodes.length > 0 ? (
            <List
              dense
              sx={{
                maxHeight: 300,
                overflow: "auto",
                border: "1px solid #eee",
                borderRadius: 1,
              }}
            >
              {existingBarcodes.map((barcode, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <Box>
                      {isEdite ? null : (
                        <IconButton
                          edge="end"
                          onClick={() => handleEditBarcode(index)}
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <Edit />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveBarcode(index)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                  sx={{
                    borderBottom: "1px solid #f5f5f5",
                    backgroundColor:
                      editIndex === index ? "action.selected" : "transparent",
                  }}
                >
                  <ListItemText
                    primary={`${index + 1}. ${barcode}`}
                    secondary={`Length: ${barcode.length} characters`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                border: "1px dashed #ddd",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No barcodes added yet. Add barcodes above to continue.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={required && !isComplete || existingBarcodes.length !== requiredQuantity}
          >
            Save Barcodes
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};
