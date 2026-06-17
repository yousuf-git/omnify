import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Typography,
  type SelectProps,
} from '@mui/material';
import { Plus } from 'lucide-react';
import { useNestedEntity, type EntityType } from '../../contexts/NestedEntityContext';

interface SelectWithAddProps extends Omit<SelectProps, 'label' | 'margin'> {
  label: string;
  options: Array<{ _id: string; label: string }>;
  error?: boolean;
  helperText?: string;
  entityType: EntityType;
  onEntityCreated?: () => void;
  hideAddButton?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  margin?: 'none' | 'dense' | 'normal';
}

const SelectWithAdd: React.FC<SelectWithAddProps> = ({
  label,
  options,
  error,
  helperText,
  entityType,
  onEntityCreated,
  hideAddButton = false,
  loading = false,
  fullWidth = true,
  margin = 'normal',
  ...selectProps
}) => {
  const { openDialog } = useNestedEntity();

  const handleAddNew = () => {
    openDialog(entityType, () => {
      if (onEntityCreated) {
        onEntityCreated();
      }
    });
  };

  const entityLabels: Record<EntityType, string> = {
    state: 'State',
    city: 'City',
    agency: 'Agency',
    reseller: 'Reseller',
    party: 'Party',
    store: 'Store',
    supportPerson: 'Support Person',
    assignedTo: 'Assigned To',
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, width: fullWidth ? '100%' : 'auto' }}>
      <FormControl 
        fullWidth={fullWidth} 
        margin={margin} 
        error={error}
        size={selectProps.size}
        sx={{ flex: 1 }}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          label={label}
          disabled={loading}
          {...selectProps}
        >
          {loading ? (
            <MenuItem disabled>Loading...</MenuItem>
          ) : (
            options.map((option) => (
              <MenuItem key={option._id} value={option._id}>
                {option.label}
              </MenuItem>
            ))
          )}
        </Select>
        {helperText && (
          <Typography variant="caption" color={error ? 'error' : 'textSecondary'}>
            {helperText}
          </Typography>
        )}
      </FormControl>
      {!hideAddButton && (
        <Tooltip title={`Add New ${entityLabels[entityType]}`}>
          <IconButton
            onClick={handleAddNew}
            size="small"
            sx={{
              mt: margin === 'normal' ? 2.5 : margin === 'dense' ? 1.5 : 1,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              width: 32,
              height: 32,
            }}
          >
            <Plus size={18} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default SelectWithAdd;
