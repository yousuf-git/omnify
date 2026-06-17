import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getResource, getResources } from "../../api/api";
import type { Item, ItemStockRecord } from "../../api/types";

interface StockInItemsDialogProps {
  open: boolean;
  onClose: () => void;
  itemIds: string[];
  stockInId: number;
   stockAdded?: number[];
}

interface EnhancedItem extends Item {
  stockRecord?: ItemStockRecord;
  quantityAdded?: number;
  minimumStock?: number;
  stockAdded?: number;
}

export function StockInItemsDialog({
  open,
  onClose,
  itemIds,
  stockInId,
}: StockInItemsDialogProps) {
  const [items, setItems] = useState<EnhancedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && itemIds.length > 0) {
      fetchItemsAndStockRecords();
    } else if (open && itemIds.length === 0) {
      setItems([]);
      setError("No item IDs provided");
    }
  }, [open, itemIds]);

// Existing interface mein stockAdded add karein
interface EnhancedItem extends Item {
  stockRecord?: ItemStockRecord;
  quantityAdded?: number;
  minimumStock?: number;
  stockAdded?: number; // Naya field add karein
}

// fetchItemsAndStockRecords function mein yeh changes karein
const fetchItemsAndStockRecords = async () => {
  try {
    setLoading(true);
    setError(null);
    setItems([]);

    // console.log("Fetching items for stockIn ID:", stockInId, "with item IDs:", itemIds);

    // Pehle stock-ins data fetch karein taki stockAdded mil jaye
    let stockInData: any = null;
    try {
      const allStockIns = await getResources("/stock-ins");
      stockInData = allStockIns.find((si: any) =>
        si.stockInId?.toString() === stockInId.toString()
      );
      // console.log("Found stock-in data:", stockInData);
    } catch (stockInError: any) {
      console.error("Error fetching stock-in data:", stockInError);
    }

    // Rest of your existing code for stock records...
    let allStockRecords: ItemStockRecord[] = [];
    try {
      allStockRecords = await getResources("/item-stock-records");
      // console.log("All stock records from API:", allStockRecords);

      // Filter records for this specific stockInId
      const relevantRecords = allStockRecords.filter((record: ItemStockRecord) => {
        // Check if stockInId matches (handling both string and number)
        const hasMatchingStockInId = record.stockInId && (
          record.stockInId.toString() === stockInId.toString() ||
          record.stockInId === String(stockInId)
        );

        // Also check if itemId is in our list
        const hasMatchingItemId = itemIds.includes(record.itemId);

        return hasMatchingStockInId && hasMatchingItemId;
      });

      // console.log("Relevant stock records after filtering:", relevantRecords);

      // If no records found by stockInId, try finding by transactions
      if (relevantRecords.length === 0) {
        // console.log("No records found by stockInId, trying transaction reference...");

        const recordsWithMatchingTransactions = allStockRecords.filter(record => {
          // Check if itemId matches
          if (!itemIds.includes(record.itemId)) return false;

          // Check transactions for matching reference
          return record.transactions && record.transactions.some(t => {
            if (!t.reference) return false;

            // Try different patterns for reference matching
            return (
              t.reference === `${stockInId}` ||
              t.reference.includes(`${stockInId}`) ||
              t.reference === stockInId.toString() ||
              t.reference.includes(stockInId.toString())
            );
          });
        });

        if (recordsWithMatchingTransactions.length > 0) {
          allStockRecords = recordsWithMatchingTransactions;
        } else {
          // If still no records, try a different approach - get all records for these items
          allStockRecords = allStockRecords.filter(record =>
            itemIds.includes(record.itemId)
          );
        }
      } else {
        allStockRecords = relevantRecords;
      }
    } catch (stockError: any) {
      console.error("Error fetching stock records:", stockError);
      setError(`Error fetching stock records: ${stockError.message}`);
      // Continue with item fetching even if stock records fail
    }

    // Now fetch the actual items
    const enhancedItems = await Promise.all(
      itemIds.map(async (itemId, index) => {
        try {
          const item = await getResource("/items", itemId);

          // Find the stock record for this item
          const stockRecord = allStockRecords.find(record =>
            record.itemId === itemId
          );

          // Calculate quantity added from stockAdded array
          let quantityAdded = 0;

          // StockInData se stockAdded array mein se value nikalain
          if (stockInData && stockInData.stockAdded && Array.isArray(stockInData.stockAdded)) {
            // Agar itemId array mein objects hain
            if (Array.isArray(stockInData.itemId) && stockInData.itemId.length > 0) {
              // Find the index of current item in stockInData.itemId array
              const itemIndex = stockInData.itemId.findIndex((itemObj: any) => {
                // Handle both string and object formats
                const objId = typeof itemObj === 'string' ? itemObj : itemObj.$oid;
                return objId === itemId;
              });

              if (itemIndex !== -1 && stockInData.stockAdded[itemIndex] !== undefined) {
                quantityAdded = stockInData.stockAdded[itemIndex];
              }
            }
            // Fallback: direct index use karein agar mapping possible nahi hai
            else if (stockInData.stockAdded[index] !== undefined) {
              quantityAdded = stockInData.stockAdded[index];
            }
          }

          // Agar stockAdded se value nahi mili, tab transactions check karein
          if (quantityAdded === 0 && stockRecord && stockRecord.transactions) {
            const stockInTransaction = stockRecord.transactions.find(t => {
              if (!t.reference) return false;

              // Multiple patterns to match the reference
              return (
                t.reference === `${stockInId}` ||
                t.reference.includes(`${stockInId}`) ||
                t.reference === stockInId.toString() ||
                t.reference.includes(stockInId.toString()) ||
                (t.type === "Stock-In" && t.reference.includes(stockInId.toString()))
              );
            });

            quantityAdded = stockInTransaction ? stockInTransaction.quantity : 0;
          }

          return {
            ...item,
            stockRecord,
            quantityAdded,
            stockAdded: quantityAdded // Alias bana dein for consistency
          };
        } catch (err) {
          console.error(`Error fetching item ${itemId}:`, err);
          // Return a basic item object with just the ID
          return {
            _id: itemId,
            itemName: "Unknown Item",
            isActive: false,
            quantityAdded: 0,
            stockAdded: 0
          } as EnhancedItem;
        }
      })
    );

    setItems(enhancedItems);

    if (enhancedItems.length === 0) {
      setError("No items found for this stock-in record");
    }

  } catch (err) {
    console.error("Error fetching data:", err);
    setError(err instanceof Error ? err.message : "Failed to load data");
  } finally {
    setLoading(false);
  }
};
  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setItems([]);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Items in Stock-In #{stockInId}
        <Typography variant="body2" color="text.secondary">
          {items.length} item(s) found of {itemIds.length} expected
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
              Stock-In ID: {stockInId}
              <br />
              Expected Item IDs: {itemIds.join(', ')}
              <br />
              Found Items: {items.map(i => i._id).join(', ')}
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
            No items found for this stock-in record
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>SKU/Model No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Remaining Stock</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Quantity Added</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Requires Serial</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const remainingStock = item.stockRecord?.remainingStock ?? 0;
                  const minimumStock = item.minimumStock ?? 0;
                  const isLowStock = remainingStock < minimumStock;
                  const quantityAdded = item.quantityAdded ?? 0;

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
                        {quantityAdded > 0 ? (
                          <Chip
                            label={`+${quantityAdded}`}
                            color="success"
                            size="small"
                            variant="filled"
                          />
                        ) : (
                          "N/A"
                        )}
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
}
