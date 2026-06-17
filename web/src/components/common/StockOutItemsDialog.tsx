import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import type { Item, ItemStockRecord, DeliveryStatus, InstallationStatus } from "../../api/types";
import { getResource, getResources } from "../../api/api";

interface StockOutItemsDialogProps {
  open: boolean;
  onClose: () => void;
  itemIds: string[];
  stockOutId: number;
  deliveryStatuses: DeliveryStatus[];
  installationStatuses: InstallationStatus[];
  deliveryStatusIds?: string[];
  installationStatusIds?: string[];
}

interface EnhancedItem extends Item {
  stockRecord?: ItemStockRecord;
  quantityRemoved?: number;
  minimumStock?: number;
  deliveryStatus: DeliveryStatus[];
  installationStatus: InstallationStatus[];
}

export function StockOutItemsDialog({
  open,
  onClose,
  itemIds,
  stockOutId,
  deliveryStatuses,
  installationStatuses,
  deliveryStatusIds = [],
  installationStatusIds = [],
}: StockOutItemsDialogProps) {
  const [items, setItems] = useState<EnhancedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Improved function to check if transaction is related to stock out
  const isTransactionRelatedToStockOut = useCallback((transaction: any, stockOutId: number) => {
    if (!transaction.reference) return false;
    
    const reference = transaction.reference.toString();
    const stockOutIdStr = stockOutId.toString();
    
    // More flexible matching for different reference formats
    return (
      reference === `StockOut-${stockOutIdStr}` ||
      reference.includes(`StockOut-${stockOutIdStr}`) ||
      reference === stockOutIdStr ||
      reference.includes(stockOutIdStr) ||
      (transaction.type && (
        transaction.type.toLowerCase().includes("stockout") ||
        transaction.type.toLowerCase().includes("stock-out") ||
        transaction.type.toLowerCase().includes("out")
      ))
    );
  }, []);

  // New function to calculate quantity removed from transactions
  const calculateQuantityRemoved = useCallback((transactions: any[], stockOutId: number) => {
    if (!transactions || transactions.length === 0) return 0;
    
    let totalRemoved = 0;
    
    transactions.forEach(transaction => {
      if (isTransactionRelatedToStockOut(transaction, stockOutId)) {
        // For stock-out transactions, quantity should be negative
        if (transaction.quantity < 0) {
          totalRemoved += Math.abs(transaction.quantity);
        } 
        // For positive quantities in stock-out context, it might be a correction
        else if (transaction.type && transaction.type.toLowerCase().includes("out")) {
          totalRemoved += transaction.quantity;
        }
      }
    });
    
    return totalRemoved;
  }, [isTransactionRelatedToStockOut]);

  const fetchItemsAndStockRecords = useCallback(async () => {
    if (!open || itemIds.length === 0) {
      if (open && itemIds.length === 0) {
        setError("No item IDs provided");
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setItems([]);
      
      // Fetch all stock records
      const allStockRecords: ItemStockRecord[] = await getResources("/item-stock-records");
      
      // Filter records for this specific stockOutId
      const relevantRecords = allStockRecords.filter((record) => {
        const hasMatchingItemId = itemIds.includes(record.itemId);
        
        // Check if record has direct stockOutId match
        const hasDirectMatch = record.stockOutId && (
          record.stockOutId.toString() === stockOutId.toString() ||
          record.stockOutId === String(stockOutId)
        );
        
        // Check if record has transactions related to this stock out
        const hasTransactionMatch = record.transactions && 
          record.transactions.some(t => isTransactionRelatedToStockOut(t, stockOutId));
        
        return hasMatchingItemId && (hasDirectMatch || hasTransactionMatch);
      });
      
      // If no direct matches found, fall back to items with any stock records
      const recordsToUse = relevantRecords.length > 0 
        ? relevantRecords 
        : allStockRecords.filter(record => itemIds.includes(record.itemId));
      
      // Fetch items and enhance with stock data
      const enhancedItems = await Promise.all(
        itemIds.map(async (itemId, index) => {
          try {
            const item = await getResource("/items", itemId);
            const stockRecord = recordsToUse.find(record => record.itemId === itemId);
            
            // Calculate quantity removed for this stock out using improved function
            let quantityRemoved = 0;
            if (stockRecord?.transactions) {
              quantityRemoved = calculateQuantityRemoved(stockRecord.transactions, stockOutId);
            }
            
            // Get delivery status for this item
            let itemDeliveryStatuses: DeliveryStatus[] = [];
            if (deliveryStatusIds.length > index) {
              const statusId = deliveryStatusIds[index];
              const status = deliveryStatuses.find(ds => ds._id === statusId);
              if (status) itemDeliveryStatuses = [status];
            }
            
            // Get installation status for this item
            let itemInstallationStatuses: InstallationStatus[] = [];
            if (installationStatusIds.length > index) {
              const statusId = installationStatusIds[index];
              const status = installationStatuses.find(is => is._id === statusId);
              if (status) itemInstallationStatuses = [status];
            }
            
            return { 
              ...item, 
              stockRecord,
              quantityRemoved,
              deliveryStatus: itemDeliveryStatuses,
              installationStatus: itemInstallationStatuses
            };
          } catch (err) {
            console.error(`Error fetching item ${itemId}:`, err);
            // Create a complete fallback object that matches EnhancedItem interface
            return {
              _id: itemId,
              itemId: itemId,
              itemName: "Unknown Item",
              modelNoSKU: "",
              unit: "",
              requiresInstallation: "no",
              requiresSerialNumberManagement: "no",
              isActive: false,
              quantityRemoved: 0,
              minimumStock: 0,
              deliveryStatus: [],
              installationStatus: [],
              stockRecord: undefined,
              barcodes: [],
              itemGroupId: "",
              description: "",
              barcode: "",
              category: "",
              brand: "",
              supplier: "",
              costPrice: 0,
              sellingPrice: 0,
              reorderLevel: 0,
              weight: 0,
              dimensions: "",
              notes: "",
              imageUrl: "",
              tags: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as EnhancedItem;
          }
        })
      );
      
      setItems(enhancedItems);
      
      if (enhancedItems.length === 0) {
        setError("No items found for this stock-out record");
      }
      
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [
    open, 
    itemIds, 
    stockOutId, 
    deliveryStatuses, 
    installationStatuses, 
    deliveryStatusIds, 
    installationStatusIds, 
    isTransactionRelatedToStockOut,
    calculateQuantityRemoved
  ]);

  useEffect(() => {
    if (open) {
      fetchItemsAndStockRecords();
    } else {
      setItems([]);
      setError(null);
      setLoading(false);
    }
  }, [open, fetchItemsAndStockRecords]);

  const renderStatusChips = (statuses: any[], type: 'delivery' | 'installation') => {
    if (!statuses || statuses.length === 0) {
      return (
        <Chip
          label="Not specified"
          size="small"
          color="default"
          variant="outlined"
        />
      );
    }
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {statuses.slice(0, 2).map((status, index) => (
          <Tooltip 
            key={index} 
            title={status.description || `ID: ${status._id}`}
            placement="top"
          >
            <Chip
              label={status[`${type}StatusName`] || `Status ${index + 1}`}
              size="small"
              color={status.isActive ? "primary" : "default"}
              variant={status.isActive ? "filled" : "outlined"}
            />
          </Tooltip>
        ))}
        {statuses.length > 2 && (
          <Tooltip 
            title={`${statuses.length - 2} more statuses`}
            placement="top"
          >
            <Chip
              label={`+${statuses.length - 2} more`}
              size="small"
              color="default"
              variant="outlined"
            />
          </Tooltip>
        )}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Items in Stock-Out #{stockOutId}
        <Typography variant="body2" color="text.secondary">
          {items.length} item(s) found
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading items and stock data...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Box sx={{ mt: 1, fontSize: '0.8rem' }}>
              Stock-Out ID: {stockOutId}
              <br />
              Expected Item IDs: {itemIds.join(', ')}
            </Box>
            <Button 
              onClick={fetchItemsAndStockRecords} 
              size="small" 
              sx={{ mt: 1 }}
            >
              Try Again
            </Button>
          </Alert>
        ) : items.length === 0 ? (
          <Alert severity="info">
            No items found for this stock-out record
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }} className="text-nowrap">Item Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} className="text-nowrap">SKU/Model No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} className="text-nowrap">Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} className="text-nowrap">Remaining Stock</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} className="text-nowrap">Quantity Removed</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} className="text-nowrap">Delivery Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} className="text-nowrap">Installation Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} className="text-nowrap">Requires Serial</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} className="text-nowrap">Unit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const remainingStock = item.stockRecord?.remainingStock ?? 0;
                  const minimumStock = item.minimumStock ?? 0;
                  const isLowStock = remainingStock < minimumStock;
                  const quantityRemoved = item.quantityRemoved ?? 0;
                  
                  return (
                    <TableRow key={item._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {item.itemName || "Unknown Item"}
                          {item.itemName && !item.isActive && (
                            <Chip
                              label="Inactive"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{item.modelNoSKU || "N/A"}</TableCell>

                      <TableCell>
                        <Chip
                          label={item.isActive ? "Active" : "Inactive"}
                          color={item.isActive ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ 
                          color: isLowStock ? 'error.main' : 'inherit',
                          fontWeight: isLowStock ? 'bold' : 'normal',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          {remainingStock}
                          {isLowStock && (
                            <Chip 
                              label="Low Stock" 
                              size="small" 
                              color="error" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                        {minimumStock > 0 && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Min: {minimumStock}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {quantityRemoved > 0 ? (
                          <Chip 
                            label={`-${quantityRemoved}`} 
                            color="error" 
                            size="small" 
                            variant="filled"
                          />
                        ) : (
                          <Tooltip title="No quantity removed found in transactions">
                            <span>N/A</span>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        {renderStatusChips(item.deliveryStatus || [], 'delivery')}
                      </TableCell>
                      <TableCell>
                        {renderStatusChips(item.installationStatus || [], 'installation')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.requiresSerialNumberManagement ? "Yes" : "No"}
                          color={item.requiresSerialNumberManagement ? "info" : "default"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{item.unit || "N/A"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={fetchItemsAndStockRecords} color="primary">
          Refresh
        </Button>
      </DialogActions>
    </Dialog>
  );
};