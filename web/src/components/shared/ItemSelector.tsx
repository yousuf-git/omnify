import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip
} from '@mui/material';

interface Item {
  _id: string;
  itemName: string;
  modelNoSKU: string;
  unit?: string;
  requiresInstallation?: boolean;
  requiresSerialNumberManagement?: boolean;
  currentStock?: number;
}

interface ItemSelectorProps {
  items: Item[];
  value: Item | null;
  onChange: (item: Item | null) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
  size?: 'small' | 'medium';
  showStock?: boolean;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({
  items,
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
  placeholder = "Search by name or SKU...",
  size = 'small',
  showStock = true
}) => {
  return (
    <Autocomplete
      size={size}
      options={items}
      getOptionLabel={(option) => `${option.itemName} (${option.modelNoSKU})`}
      getOptionKey={(option) => option._id}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      disabled={disabled}
      filterOptions={(options, { inputValue }) =>
        options.filter(
          (option) =>
            option.itemName
              .toLowerCase()
              .includes(inputValue.toLowerCase()) ||
            option.modelNoSKU
              .toLowerCase()
              .includes(inputValue.toLowerCase())
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option._id}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                {option.itemName}
              </Typography>
              {/* {showStock && (
                <Chip 
                  label={`Stock: ${option.currentStock || 0}`} 
                  size="small" 
                  variant="outlined"
                  color={option.currentStock && option.currentStock > 0 ? "success" : "default"}
                />
              )} */}
            </Box>
            <Typography variant="caption" color="text.secondary">
              SKU: {option.modelNoSKU} 
              {option.unit && ` | Unit: ${option.unit}`}
              {option.requiresInstallation && " | Requires Installation"}
              {option.requiresSerialNumberManagement && " | Serial Number Managed"}
            </Typography>
          </Box>
        </li>
      )}
    />
  );
};