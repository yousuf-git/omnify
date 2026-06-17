import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  Archive,
  Edit,
} from "lucide-react";

type Severity = "error" | "warning" | "info" | "success";
type ActionVariant = "delete" | "update" | "archive" | "custom";

interface DialogConfig {
  title: string;
  description: string; // Supports {variable} interpolation
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  variables?: Record<string, string>; // For description interpolation
}

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  config: DialogConfig;
  severity?: Severity;
  actionVariant?: ActionVariant;
  icon?: React.ReactNode;
  isLoading?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  confirmButtonColor?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  cancelButtonColor?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  config,
  severity = "info",
  actionVariant = "custom",
  icon,
  isLoading = false,
  maxWidth = "sm",
  fullWidth = true,
  confirmButtonColor,
  cancelButtonColor,
}) => {
  const getSeverityStyles = () => {
    const styles = {
      error: {
        bgcolor: "error.light",
        iconColor: "#d32f2f",
        icon: <AlertTriangle size={24} />,
        defaultConfirmText: "Delete",
        defaultTitle: "Confirm Deletion",
      },
      warning: {
        bgcolor: "warning.light",
        iconColor: "#ed6c02",
        icon: <AlertTriangle size={24} />,
        defaultConfirmText: "Continue",
        defaultTitle: "Warning",
      },
      info: {
        bgcolor: "info.light",
        iconColor: "#0288d1",
        icon: <Info size={24} />,
        defaultConfirmText: "Confirm",
        defaultTitle: "Confirmation",
      },
      success: {
        bgcolor: "success.light",
        iconColor: "#2e7d32",
        icon: <CheckCircle size={24} />,
        defaultConfirmText: "Confirm",
        defaultTitle: "Success",
      },
    };

    return styles[severity];
  };

  const getActionVariantStyles = () => {
    const variants = {
      delete: {
        icon: <Trash2 size={24} />,
        confirmText: "Delete",
        severity: "error" as Severity,
      },
      update: {
        icon: <Edit size={24} />,
        confirmText: "Update",
        severity: "info" as Severity,
      },
      archive: {
        icon: <Archive size={24} />,
        confirmText: "Archive",
        severity: "warning" as Severity,
      },
      custom: {
        icon: null,
        confirmText: "Confirm",
        severity: "info" as Severity,
      },
    };

    return variants[actionVariant];
  };

  const severityStyles = getSeverityStyles();
  const variantStyles = getActionVariantStyles();
  const effectiveSeverity = severity || variantStyles.severity;

  // Merge default texts with provided config
  const mergedConfig = {
    title: config.title || severityStyles.defaultTitle,
    description: config.description,
    confirmText: config.confirmText || variantStyles.confirmText,
    cancelText: config.cancelText || "Cancel",
    loadingText: config.loadingText || "Processing...",
    variables: config.variables || {},
  };

  // Interpolate variables in description
  const interpolateDescription = () => {
    let desc = mergedConfig.description;
    Object.entries(mergedConfig.variables).forEach(([key, value]) => {
      desc = desc.replace(new RegExp(`\\{${key}\\}`, "g"), value);
    });
    return desc;
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle sx={{ pb: 1 }} id="confirmation-dialog-title">
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: severityStyles.bgcolor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden="true"
          >
            {icon || variantStyles.icon || severityStyles.icon}
          </Box>
          <Typography variant="h6" fontWeight="bold" component="span">
            {mergedConfig.title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }} id="confirmation-dialog-description">
        <Typography variant="body1" color="text.secondary">
          {interpolateDescription()}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isLoading}
          sx={{ minWidth: 100 }}
          color={cancelButtonColor}
          aria-label="Cancel"
        >
          {mergedConfig.cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={
            confirmButtonColor ||
            (effectiveSeverity === "error" ? "error" : "primary")
          }
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
          sx={{ minWidth: 100 }}
          aria-label={mergedConfig.confirmText}
        >
          {isLoading ? mergedConfig.loadingText : mergedConfig.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
