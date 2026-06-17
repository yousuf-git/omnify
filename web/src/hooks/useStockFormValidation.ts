import { useState } from 'react';

export interface ValidationError {
  [key: string]: string | string[] | ValidationError[];
}

export interface StockFormValidationConfig {
  requireInvoice?: boolean;
  requireBarcodes?: boolean;
  allowNegativeStock?: boolean;
}

export const useStockFormValidation = (config: StockFormValidationConfig = {}) => {
  const [errors, setErrors] = useState<ValidationError>({});

  const validateStockInForm = (formData: any, stockItems: any[]): boolean => {
    const newErrors: ValidationError = {};
    let hasErrors = false;

    // Validate basic form fields
    if (!formData.partyId) {
      newErrors.partyId = "Party is required";
      hasErrors = true;
    }
    if (!formData.warehouseId) {
      newErrors.warehouseId = "Warehouse is required";
      hasErrors = true;
    }
    if (!formData.stockInCategoryId) {
      newErrors.stockInCategoryId = "Stock In Category is required";
      hasErrors = true;
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
      hasErrors = true;
    }

    // Optional invoice validation
    if (config.requireInvoice && !formData.invoiceNo?.trim()) {
      newErrors.invoiceNo = "Invoice number is required";
      hasErrors = true;
    }

    // Validate items
    const itemErrors: ValidationError[] = [];
    if (stockItems.length === 0) {
      newErrors.items = "At least one item is required";
      hasErrors = true;
    } else {
      stockItems.forEach((item, index) => {
        const itemError: ValidationError = {};
        
        if (!item.itemId) {
          itemError.itemId = "Item is required";
          hasErrors = true;
        }
        
        if (!item.newStock || Number(item.newStock) <= 0) {
          itemError.newStock = "Stock must be greater than 0";
          hasErrors = true;
        }

        // Optional barcode validation
        if (config.requireBarcodes && item.requiresSerialNumberManagement) {
          if (!item.barcodes || item.barcodes.length !== Number(item.newStock)) {
            itemError.barcodes = `Please add ${item.newStock} barcodes`;
            hasErrors = true;
          }
        }

        if (Object.keys(itemError).length > 0) {
          itemErrors[index] = itemError;
        }
      });

      if (itemErrors.length > 0) {
        newErrors.items = itemErrors;
      }
    }

    setErrors(newErrors);
    return !hasErrors;
  };

const validateStockOutForm = (formData: any, isEditMode: boolean = false): boolean => {
  const newErrors: ValidationError = {};
  let hasErrors = false;

    // Validate header fields
    if (!formData.partyId) {
      newErrors.partyId = "Party is required";
      hasErrors = true;
    }
    // if (!formData.storeId) {
    //   newErrors.storeId = "Store is required";
    //   hasErrors = true;
    // }
    if (!formData.warehouseId) {
      newErrors.warehouseId = "Warehouse is required";
      hasErrors = true;
    }
    // if (!formData.logisticsProviderCategoryId) {
    //   newErrors.logisticsProviderCategoryId = "Logistics provider is required";
    //   hasErrors = true;
    // }
    // if (!formData.trackingNo?.trim()) {
    //   newErrors.trackingNo = "Tracking number is required";
    //   hasErrors = true;
    // }

    // Optional invoice validation
    // if (config.requireInvoice && !formData.invoiceNo?.trim()) {
    //   newErrors.invoiceNo = "Invoice number is required";
    //   hasErrors = true;
    // }

  // Validate items
  const itemErrors: ValidationError[] = [];
  if (!formData.items || formData.items.length === 0) {
    newErrors.items = "At least one item is required";
    hasErrors = true;
  } else {
    formData.items.forEach((item: any, index: number) => {
      const itemError: ValidationError = {};
      
      if (!item.itemId) {
        itemError.itemId = "Item is required";
        hasErrors = true;
      }
      if (!item.deliveryStatusId) {
        itemError.deliveryStatusId = "Delivery status is required";
        hasErrors = true;
      }
      if (item.requiresInstallation && !item.installationStatusId) {
        itemError.installationStatusId = "Installation status is required";
        hasErrors = true;
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        itemError.quantity = "Quantity must be greater than 0";
        hasErrors = true;
      }

          // UPDATED: Only validate stock availability for serialized items in new stock-outs
      if (!isEditMode && 
          item.requiresSerialNumberManagement && 
          Number(item.quantity) > Number(item.remainingStock)) {
        itemError.quantity = `Cannot exceed remaining stock of ${item.remainingStock} for serialized items`;
        hasErrors = true;
      }

      // Optional barcode validation
      if (config.requireBarcodes && item.requiresSerialNumberManagement) {
        if (item.barcodes.length !== Number(item.quantity)) {
          itemError.barcodes = [`Please add exactly ${item.quantity} barcodes`];
          hasErrors = true;
        }
      }

      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });

    if (itemErrors.length > 0) {
      newErrors.items = itemErrors;
    }
  }

  setErrors(newErrors);
  return !hasErrors;
};

  const clearErrors = () => setErrors({});

  return {
    errors,
    validateStockInForm,
    validateStockOutForm,
    clearErrors,
    setErrors
  };
};