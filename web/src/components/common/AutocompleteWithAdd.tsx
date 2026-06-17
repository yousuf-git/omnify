import React from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  type AutocompleteProps,
} from '@mui/material';
import { Plus } from 'lucide-react';
import { useNestedEntity, type EntityType } from '../../contexts/NestedEntityContext';

interface AutocompleteWithAddProps<T> extends Omit<AutocompleteProps<T, false, false, false>, 'renderInput'> {
  label: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  entityType: EntityType;
  onEntityCreated?: () => void;
  textFieldProps?: {
    size?: 'small' | 'medium';
    margin?: 'none' | 'dense' | 'normal';
    [key: string]: any;
  };
  hideAddButton?: boolean;
}

function AutocompleteWithAdd<T>({
  label,
  error,
  helperText,
  required,
  entityType,
  onEntityCreated,
  textFieldProps = {},
  hideAddButton = false,
  ...autocompleteProps
}: AutocompleteWithAddProps<T>) {
  const { openDialog } = useNestedEntity();

  const handleAddNew = () => {
    openDialog(entityType, () => {
      // This callback is called when the entity is successfully created
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
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, width: '100%' }}>
      <Autocomplete
        {...autocompleteProps}
        sx={{ flex: 1, ...autocompleteProps.sx }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            error={error}
            helperText={helperText}
            {...textFieldProps}
          />
        )}
      />
      {!hideAddButton && (
        <Tooltip title={`Add New ${entityLabels[entityType]}`}>
          <IconButton
            onClick={handleAddNew}
            size="small"
            sx={{
              mt: textFieldProps.margin === 'normal' ? 2.5 : textFieldProps.margin === 'dense' ? 1.5 : 1,
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
}

export default AutocompleteWithAdd;
