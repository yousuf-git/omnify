// UserFilterPanel.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Card,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import { SlidersHorizontal, X } from 'lucide-react';
import type { FilterUser, User } from '../../api/types';

interface UserFilterPanelProps {
  filters: FilterUser;
  onFiltersChange: (filters: FilterUser) => void;
  onClearFilters: () => void;
  users: User[]; // Add users prop to get the list of users for autocomplete
}

export function UserFilterPanel({
  filters,
  onFiltersChange,
  onClearFilters,
  users, // Receive users data
}: UserFilterPanelProps) {
  const [open, setOpen] = useState(false); // collapsed by default
  const [nameOptions, setNameOptions] = useState<string[]>([]);
  const [emailOptions, setEmailOptions] = useState<string[]>([]);

  // Extract unique names and emails from users
  useEffect(() => {
    const uniqueNames = Array.from(new Set(users.map(user => user.name).filter(Boolean)));
    const uniqueEmails = Array.from(new Set(users.map(user => user.email).filter(Boolean)));

    setNameOptions(uniqueNames as string[]);
    setEmailOptions(uniqueEmails as string[]);
  }, [users]);

  const handleFilterChange = (key: keyof FilterUser, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Active filters, excluding the search box (which lives in the page header).
  const activeCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v).length;

  return (
    <Card sx={{ mb: 2.5, overflow: 'hidden' }}>
      {/* Header — filter icon toggle */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 1.25, cursor: 'pointer',
          borderBottom: open ? '1px solid' : 'none', borderColor: 'divider',
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Filters</Typography>
          {activeCount > 0 && (
            <Box sx={{ minWidth: 18, height: 18, px: 0.5, borderRadius: 999, bgcolor: 'primary.main', color: '#fff', fontSize: '0.65rem', fontWeight: 700, display: 'grid', placeItems: 'center' }}>
              {activeCount}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
          {activeCount > 0 && (
            <Button size="small" variant="text" startIcon={<X size={14} />} onClick={onClearFilters}>
              Clear
            </Button>
          )}
          <IconButton
            size="small"
            onClick={() => setOpen((o) => !o)}
            aria-label="toggle filters"
            sx={{ color: open ? 'primary.main' : 'text.secondary', bgcolor: open ? 'action.selected' : 'transparent' }}
          >
            <SlidersHorizontal size={17} />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={open} timeout={260}>
        {/* Uniform grid — every control gets an equal, aligned cell */}
        <Box
          sx={{
            p: 2,
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          }}
        >
          {/* Searchable Name Field */}
          <Autocomplete
            size="small"
            options={nameOptions}
            value={filters.name || null}
            onChange={(_, newValue) => {
              handleFilterChange('name', newValue || '');
            }}
            fullWidth
            renderInput={(params) => (
              <TextField {...params} label="Name" />
            )}
          />

          {/* Searchable Email Field */}
          <Autocomplete
            size="small"
            options={emailOptions}
            value={filters.email || null}
            onChange={(_, newValue) => {
              handleFilterChange('email', newValue || '');
            }}
            fullWidth
            renderInput={(params) => (
              <TextField {...params} label="Email" />
            )}
          />

          {/* Role Field */}
          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={filters.role || ''}
              label="Role"
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Created At"
            type="date"
            value={filters.createdAt || ''}
            onChange={(e) => handleFilterChange('createdAt', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
        </Box>
      </Collapse>
    </Card>
  );
}
