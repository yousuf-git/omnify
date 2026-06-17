import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from "@mui/material";
import type {
  FilterStockItem as ImportedFilterStockItem,
  Item,
  Party,
  StockIn,
  StockItem as StockItemType,
  StockOut,
  Store,
  TableColumn,
} from "../api/types";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources } from "../api/api";
import { DynamicTable } from "../components/common/table";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate } from "react-router-dom";
import { Eye, Search } from "lucide-react";

interface ExtendedFilterStockItem extends ImportedFilterStockItem {
  hasTicket: string;
}

interface StockItemDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  stockItem: StockItemType | null;
  items: Item[];
  stockIn: StockIn[];
}

function StockItemDetailsDialog({
  open,
  onClose,
  stockItem,
  items,
  stockIn
}: StockItemDetailsDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [loadingStockOut, setLoadingStockOut] = useState(false);
  const [stockOutDetails, setStockOutDetails] = useState<StockOut | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    stockIn: true,
    stockOut: true,
    transactions: true
  });
  const [parties, setParties] = useState<Party[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const navigate = useNavigate();
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch parties and stores
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const [partiesResponse, storesResponse] = await Promise.all([
          getResources("/parties"),
          getResources("/stores")
        ]);
        
        setParties(Array.isArray(partiesResponse) ? partiesResponse : []);
        setStores(Array.isArray(storesResponse) ? storesResponse : []);
      } catch (error) {
        console.error("Error fetching additional data:", error);
      }
    };

    if (open) {
      fetchAdditionalData();
    }
  }, [open]);

  useEffect(() => {
    const fetchStockOutDetails = async () => {
      if (!stockItem?.stockOutId) {
        setStockOutDetails(null);
        return;
      }

      try {
        setLoadingStockOut(true);
        const response = await getResources(`/stock-outs/${stockItem.stockOutId}`);
        setStockOutDetails(response);
      } catch (error:any) {
        console.error("Error fetching stock out details:", error);
        setStockOutDetails(null);
      } finally {
        setLoadingStockOut(false);
      }
    };

    if (open && stockItem?.stockOutId) {
      fetchStockOutDetails();
    } else {
      setStockOutDetails(null);
    }
  }, [open, stockItem?.stockOutId]);

  // Helper function to get party name by ID
  const getPartyName = (partyId: string | Party): string => {
    if (typeof partyId === 'object') {
      return partyId.partyName || 'Unknown';
    }
    
    const party = parties.find(p => p._id === partyId);
    return party ? party.partyName : 'Unknown';
  };

  // Helper function to get store name by ID
  const getStoreName = (storeId: string | Store): string => {
    if (typeof storeId === 'object') {
      return storeId.storeName || 'Unknown';
    }
    
    const store = stores.find(s => s._id === storeId);
    return store ? store.storeName : 'Unknown';
  };

  if (!stockItem) return null;

  const relatedItem = items.find((item: Item) => item._id === stockItem?.itemId) || null;
  const relatedStockIn = stockIn.find((stock: StockIn) => stock._id === stockItem?.stockInId) || null;

  const renderTransactionItem = (label: string, value: any, format?: (val: any) => React.ReactNode) =>  {
    const displayValue = () => {
      if (typeof value === 'object' && value !== null) {
        return value.storeName || value.partyName || value.itemName || value._id || value.stockItemId || 'N/A';
      }
      return value;
    };

    return (
      <div>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body1">
          {format ? format(displayValue()) : (displayValue() || 'N/A')}
        </Typography>
      </div>
    );
  };

  const formatDate = (dateString: string) => 
    dateString ? new Date(dateString).toLocaleString() : 'N/A';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Stock Item Details</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Item Details Section */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Item Details
            </Typography>
            <IconButton size="small" onClick={() => toggleSection('transactions')}>
              {expandedSections.transactions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Divider />
          <Collapse in={expandedSections.transactions}>
            <Box mt={2} display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={2}>
              {renderTransactionItem("Item Name", relatedItem?.itemName)}
              {renderTransactionItem("Serial Number", stockItem.serialNo)}
              {renderTransactionItem("Stock Item ID", stockItem.stockItemId)}
              {renderTransactionItem("Has Ticket", stockItem.hasTicket ? "Yes" : "No")}
              {renderTransactionItem("Created At", stockItem.createdAt, formatDate)}
              {renderTransactionItem("Updated At", stockItem.updatedAt, formatDate)}
              {renderTransactionItem("Status", stockItem.stockOutId ? 'Stocked Out' : 'In Stock')}
            </Box>
          </Collapse>
        </Box>

        {/* Stock In Details Section */}
        {relatedStockIn && (
          <Box mb={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Stock In Details
              </Typography>
              <IconButton size="small" onClick={() => toggleSection('stockIn')}>
                {expandedSections.stockIn ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Divider />
            <Collapse in={expandedSections.stockIn}>
              <Box mt={2} display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={2}>
                {renderTransactionItem("Stock In ID", relatedStockIn._id)}
                {renderTransactionItem("Stock In Reference", relatedStockIn.stockInId)}
                {renderTransactionItem("Date", relatedStockIn.createdAt, formatDate)}
                {renderTransactionItem("Stock Added", relatedStockIn.stockAdded)}
                {renderTransactionItem("Invoice No", relatedStockIn.invoiceNo)}
                {renderTransactionItem("Notes", relatedStockIn.notes)}
                {renderTransactionItem("Party", getPartyName(relatedStockIn.partyId))}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Stock Out Details Section */}
        {stockItem.stockOutId && (
          <Box mb={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Stock Out Details
              </Typography>
              <IconButton size="small" onClick={() => toggleSection('stockOut')}>
                {expandedSections.stockOut ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Divider />
            <Collapse in={expandedSections.stockOut}>
              {loadingStockOut ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={24} />
                </Box>
              ) : stockOutDetails ? (
                <Box mt={2} display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={2}>
                  {renderTransactionItem("Stock Out ID", stockOutDetails._id)}
                  {renderTransactionItem("Stock Out Reference", stockOutDetails.stockOutId)}
                  {renderTransactionItem("Date", stockOutDetails.createdAt, formatDate)}
                  {renderTransactionItem("Tracking No", stockOutDetails.trackingNo)}
                  {renderTransactionItem("Invoice No", stockOutDetails.invoiceNo)}
                  {stockOutDetails.storeId && (
                    renderTransactionItem("Store", getStoreName(stockOutDetails.storeId))
                  )}
                  {stockOutDetails.items?.map((item, index) => (
                    <div key={index}>
                      {renderTransactionItem("Quantity", item.quantity)}
                      {renderTransactionItem("Delivery Status", item.deliveryStatusId)}
                    </div>
                  ))}
                  {stockOutDetails.logisticsProviderCategory && (
                    renderTransactionItem("Logistics Provider", stockOutDetails.logisticsProviderCategory.logisticsProviderCategoryName)
                  )}
                </Box>
              ) : (
                <Box mt={2}>
                  <Alert severity="info">No stock out details available</Alert>
                </Box>
              )}
            </Collapse>
          </Box>
        )}

        {/* Transaction Timeline Section */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Transaction Timeline
          </Typography>
          <Divider />
          <Box mt={2}>
            {relatedStockIn && (
              <Box mb={2} p={2} bgcolor="action.hover" borderRadius={1}>
                <Box className="flex justify-between">
                <Typography variant="subtitle2" color="primary">
                  Stock In - {formatDate(relatedStockIn.createdAt as string)} 
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                 onClick={() => navigate(`/stock-in-details/${relatedStockIn._id}`)}
                  startIcon={<Eye size={16} />}
                >
                  View
                </Button>
                </Box>
                <Typography variant="body2">
                  Added to inventory from {getPartyName(relatedStockIn.partyId)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reference: {relatedStockIn.stockInId}
                </Typography>
              </Box>
            )}

            {stockOutDetails && (
              <Box mb={2} p={2} bgcolor="action.hover" borderRadius={1}>
                <Box className="flex justify-between">
                  <Typography variant="subtitle2" color="secondary">
                  Stock Out - {formatDate(stockOutDetails.createdAt as string)}
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => navigate(`/stock-out-details/${stockOutDetails._id}`)}
                  startIcon={<Eye size={16} />}
                >
                  View
                </Button>
                </Box>

                <Typography variant="body2">
                  {stockOutDetails.storeId ? (
                    `Shipped to ${getStoreName(stockOutDetails.storeId)}`
                  ) : (
                    "Shipped to unknown destination"
                  )}
                  {stockOutDetails.logisticsProviderCategory && (
                    ` via ${stockOutDetails.logisticsProviderCategory.logisticsProviderCategoryName}`
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stockOutDetails.trackingNo && `Tracking: ${stockOutDetails.trackingNo}`}
                </Typography>
              </Box>
            )}

            {!relatedStockIn && !stockOutDetails && (
              <Alert severity="info">No transaction history available</Alert>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function StockItemPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExtendedFilterStockItem>({
    search: "",
    stockItemId: "",
    itemId: "",
    serialNo: "",
    stockInId: "",
    stockOutId: "",
    createdAt: "",
    updatedAt: "",
    hasTicket: "",
  });

  const [stockItem, setStockItem] = useState<StockItemType[]>([]);
  const [stockIn, setStockIn] = useState<StockIn[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: StockItemType | null;
    loading: boolean;
  }>({ open: false, item: null, loading: false });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    item: StockItemType | null;
  }>({ open: false, item: null });

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources("/items?showInactive=true");
      setItems(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error loading items:", err);
      setError(err instanceof Error ? err.message : "Failed to load items ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const loadStockIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources("/stock-ins");
      setStockIn(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error loading items:", err);
      setError(err instanceof Error ? err.message : "Failed to load items ");
      setStockIn([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockIn();
  }, []);

  const columns: TableColumn<StockItemType>[] = [
    {
      id: "itemId",
      label: "Item",
      format: (value: any) => {
        const it = (value && typeof value === "object") ? value : items.find((g) => g._id === value);
        return it ? (
          <Box display="flex" alignItems="center" gap={0.5}>
            {it.itemName}
            {!it.isActive && (
              <Chip
                label="Inactive"
                size="small"
                color="error"
                variant="outlined"
              />
            )}
          </Box>
        ) : (
          "Unknown"
        );
      },
    },
    { id: "serialNo", label: "Serial No" },
    {
      id: "hasTicket",
      label: "Has Ticket",
      format: (value) => (
        <Chip
          label={value ? "Yes" : "No"}
          size="small"
          color={value ? "success" : "default"}
          variant={value ? "filled" : "outlined"}
        />
      ),
    },
    {
      id: "stockInId",
      label: "Stock In",
      format: (value: any) => {
        if (!value) return <Chip label="Opening" color="info" size="small" />;
        const rec =
          value && typeof value === "object"
            ? value
            : stockIn.find((item) => item._id === value || item.stockInId === value);
        const label = rec ? `#${rec.stockInId ?? rec._id}` : String(value);
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">{label}</Typography>
            {rec && !rec.isActive && (
              <Chip label="Inactive" size="small" color="error" variant="outlined" />
            )}
          </Box>
        );
      },
    },
    {
      id: "stockOutId",
      label: "Stock Out",
      format: (value: any) => {
        if (!value) return <Typography variant="body2" color="text.secondary">—</Typography>;
        const num = value && typeof value === "object" ? (value.stockOutId ?? value._id) : value;
        return <Chip label={`#${num}`} size="small" color="secondary" variant="outlined" />;
      },
    },
    {
      id: "updatedAt",
      label: "Updated At",
      format: (value) => new Date(value).toLocaleDateString('en-GB'),
    },
    {
      id: "createdAt",
      label: "Created At",
      format: (value) => new Date(value).toLocaleDateString('en-GB'),
    },
  ];

  const loadStockItem = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources("/stock-items");
      setStockItem(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error loading Warehouse:", err);
      setError(err instanceof Error ? err.message : "Failed to load Warehouse");
      setStockItem([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockItem();
  }, []);

  const filteredItems = useMemo(() => {
    const safeItems = stockItem || [];

    return safeItems.filter((item) => {
      // Convert all searchable fields to strings for comparison
      const stockItemId = String(item.stockItemId || "");
      const serialNo = String(item.serialNo || "");
      const stockInId = String(item.stockInId || "");
      const stockOutId = String(item.stockOutId || "");
      const updatedAt = String(item.updatedAt || "");
      const createdAt = String(item.createdAt || "");
      const hasTicket = String(item.hasTicket || "");
      
      // Get the associated item details
      const relatedItem = items.find((i) => i._id === item.itemId);
      const itemName = relatedItem?.itemName ? String(relatedItem.itemName) : "";
      const modelNoSKU = relatedItem?.modelNoSKU ? String(relatedItem.modelNoSKU) : "";

      // Prepare search string (lowercase for case-insensitive search)
      const searchStr = filters.search?.toLowerCase() || "";

      // Check if any field matches the search term
      const matchesSearch =
        !filters.search ||
        stockItemId.toLowerCase().includes(searchStr) ||
        serialNo.toLowerCase().includes(searchStr) ||
        stockInId.toLowerCase().includes(searchStr) ||
        stockOutId.toLowerCase().includes(searchStr) ||
        itemName.toLowerCase().includes(searchStr) ||  // Search by itemName
        modelNoSKU.toLowerCase().includes(searchStr) ||  // Search by modelNoSKU
        updatedAt.toLowerCase().includes(searchStr) ||
        createdAt.toLowerCase().includes(searchStr) ||
        hasTicket.toLowerCase().includes(searchStr);

      // Other filter conditions
      const matchesCreatedAt =
        !filters.createdAt || item.createdAt === filters.createdAt;
      const matchesSerialNo =
        !filters.serialNo || item.serialNo === filters.serialNo;
      const matchesStockInId =
        !filters.stockInId || item.stockInId === filters.stockInId;
      const matchesStockOutId =
        !filters.stockOutId || item.stockOutId === filters.stockOutId;
      const matchesHasTicket = 
        filters.hasTicket === "" || 
        (filters.hasTicket === "true" && item.hasTicket) || 
        (filters.hasTicket === "false" && !item.hasTicket);

      return (
        matchesSearch &&
        matchesCreatedAt &&
        matchesSerialNo &&
        matchesStockInId &&
        matchesStockOutId &&
        matchesHasTicket
      );
    });
  }, [stockItem, filters, items]);

  const handleViewDetails = (item: StockItemType) => {
    setDetailsDialog({ open: true, item });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.item) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      await deleteResource("/stock-items", deleteDialog.item._id as string);
      setStockItem((prev: StockItemType[] | null) => {
        if (!prev) return [];
        return prev.filter((item) => item._id !== deleteDialog.item!._id);
      });
      showSnackbar("Stock Item deleted successfully", "success");
      setDeleteDialog({ open: false, item: null, loading: false });
    } catch (error:any) {
      console.error("Error deleting Stock Item:", error);
       showSnackbar(`Error: ${error.message}`, "error");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (stockItem === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No items data available</Alert>
      </Box>
    );
  }

  return (
    <Box className="flex flex-col">
      {/* Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end", justifyContent: "space-between", mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "stretch", gap: 1.5 }}>
          <Box sx={{ width: "3px", borderRadius: "2px", bgcolor: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Stock Transactions</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Stock transaction history & details
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search stock items…"
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            sx={{ width: { xs: "100%", sm: 260 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} style={{ opacity: 0.6 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Has Ticket</InputLabel>
            <Select
              value={filters.hasTicket}
              label="Has Ticket"
              onChange={(e) => setFilters({ ...filters, hasTicket: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Table */}
      <DynamicTable
        serialColumn
        data={filteredItems || []}
        columns={columns}
        actions={[
          {
            icon: <OpenInNewIcon fontSize="small" />,
            tooltip: "View details",
            color: "primary",
            onClick: handleViewDetails,
          },
        ]}
      />

      {/* Details Dialog */}
      <StockItemDetailsDialog
        open={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false, item: null })}
        stockItem={detailsDialog.item}
        items={items}
        stockIn={stockIn}
      />

      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, item: null, loading: false })
        }
        onConfirm={confirmDelete}
        isLoading={deleteDialog.loading}
        config={{
          title: "Delete Item",
          description:
            "Are you sure you want to delete {itemName}? This action cannot be undone.",
          variables: { itemName: deleteDialog.item?.serialNo || "" },
          confirmText: "Delete",
          loadingText: "Deleting...",
        }}
        severity="error"
        actionVariant="delete"
      />

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