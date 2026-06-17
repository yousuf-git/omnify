// GenericFilterPanel.tsx
import { Box, TextField, Button } from "@mui/material";
import type { FilterBase } from "../../api/types";

interface GenericFilterPanelProps<T extends FilterBase> {
  filters: T;
  onFiltersChange: (filters: T) => void;
  onClearFilters: () => void;
  searchOnly?: boolean;
}

export const GenericFilterPanel = <T extends FilterBase>({
  filters,
  onFiltersChange,
  onClearFilters,
  searchOnly = true,
}: GenericFilterPanelProps<T>) => (
  <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
    <TextField
      label="Search"
      value={filters.search || ""}
      onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
      size="small"
      sx={{ fontSize: "0.875rem" }}
    />

    {!searchOnly && (
      /* Add additional filter fields here if needed */
      <TextField
        label="Category"
        value={filters.category || ""}
        onChange={(e) =>
          onFiltersChange({ ...filters, category: e.target.value })
        }
        size="small"
        sx={{ fontSize: "0.875rem" }}
      />
    )}

    <Button
      onClick={onClearFilters}
      sx={{ fontSize: "0.875rem" }}
      variant="outlined"
    >
      <span className="text-sm">Clear Filters</span>
    </Button>
  </Box>
);
