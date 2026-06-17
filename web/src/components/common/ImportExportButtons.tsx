import React, { useRef } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  Download,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { ImportResult, Item } from "../../api/types";

interface ImportExportButtonsProps {
  items: Item[];
  onImportComplete: () => void;
  isLoading?: boolean;
}

export const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({
  items,
  onImportComplete,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importDialog, setImportDialog] = React.useState(false);
  const [importResult, setImportResult] = React.useState<ImportResult | null>(
    null
  );
  const [importing, setImporting] = React.useState(false);

  const handleExport = () => {
    const headers = [
      "Item ID",
      "Item Name",
      "Model No/SKU",
      "Requires Installation",
      "Requires Serial Number Management",
      "Item Group ID",
      "Created At",
      "Updated At",
    ];

    const csvContent = [
      headers.join(","),
      ...items.map((item) =>
        [
          item._id,
          `"${item.itemName}"`,
          `"${item.modelNoSKU}"`,
          item.requiresInstallation,
          item.requiresSerialNumberManagement,
          item.itemGroupId,
          item.createdAt || "",
          item.updatedAt || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `items_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportDialog(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        throw new Error(
          "File must contain at least a header row and one data row"
        );
      }

      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));
      const expectedHeaders = [
        "Item Name",
        "Model No/SKU",
        "Requires Installation",
        "Requires Serial Number Management",
        "Item Group ID",
      ];

      const missingHeaders = expectedHeaders.filter(
        (h) => !headers.includes(h)
      );
      if (missingHeaders.length > 0) {
        throw new Error(
          `Missing required headers: ${missingHeaders.join(", ")}`
        );
      }

      const result: ImportResult = { success: 0, errors: [] };

      // Simulate API calls for import
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i]
            .split(",")
            .map((v) => v.trim().replace(/"/g, ""));
          const itemData = {
            itemName: values[headers.indexOf("Item Name")] || "",
            modelNoSKU: values[headers.indexOf("Model No/SKU")] || "",
            requiresInstallation: (values[
              headers.indexOf("Requires Installation")
            ] || "no") as "yes" | "no",
            requiresSerialNumberManagement: (values[
              headers.indexOf("Requires Serial Number Management")
            ] || "no") as "yes" | "no",
            itemGroupId: values[headers.indexOf("Item Group ID")] || "",
          };

          // Validate required fields
          if (
            !itemData.itemName ||
            !itemData.modelNoSKU ||
            !itemData.itemGroupId
          ) {
            result.errors.push({
              row: i + 1,
              message:
                "Missing required fields: Item Name, Model No/SKU, or Item Group ID",
            });
            continue;
          }

          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Here you would call your actual API
          // await createItem(itemData);

          result.success++;
        } catch (error) {
          result.errors.push({
            row: i + 1,
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      setImportResult(result);

      if (result.success > 0) {
        onImportComplete();
      }
    } catch (error) {
      setImportResult({
        success: 0,
        errors: [
          {
            row: 0,
            message:
              error instanceof Error ? error.message : "Failed to process file",
          },
        ],
      });
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCloseImportDialog = () => {
    setImportDialog(false);
    setImportResult(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="success"
        startIcon={<Download size={16} />}
        onClick={handleExport}
        disabled={isLoading || items.length === 0}
        sx={{ fontSize: 12 }}
      >
        <span className="hidden md:block">Export</span>
      </Button>

      <Button
        variant="outlined"
        color="primary"
        startIcon={<Upload size={16} />}
        onClick={handleImportClick}
        disabled={isLoading}
        sx={{ fontSize: 12 }}
      >
        <span className="hidden md:block">Import</span>
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      <Dialog
        open={importDialog}
        onClose={handleCloseImportDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <FileText size={24} />
            <Typography variant="h6">Import Results</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {importing ? (
            <Box sx={{ py: 3 }}>
              <Typography variant="body1" gutterBottom>
                Processing import file...
              </Typography>
              <LinearProgress sx={{ mt: 2 }} />
            </Box>
          ) : importResult ? (
            <Box sx={{ py: 1 }}>
              <Box display="flex" gap={2} mb={3}>
                <Chip
                  icon={<CheckCircle size={16} />}
                  label={`${importResult.success} Successful`}
                  color="success"
                  variant="outlined"
                />
                {importResult.errors.length > 0 && (
                  <Chip
                    icon={<AlertCircle size={16} />}
                    label={`${importResult.errors.length} Errors`}
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>

              {importResult.success > 0 && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Successfully imported {importResult.success} items.
                </Alert>
              )}

              {importResult.errors.length > 0 && (
                <Box>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {importResult.errors.length} items failed to import:
                  </Alert>
                  <List dense sx={{ maxHeight: 200, overflow: "auto" }}>
                    {importResult.errors.map((error, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={`Row ${error.row}: ${error.message}`}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseImportDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
