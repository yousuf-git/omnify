import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Collapse,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import { SlidersHorizontal, X } from "lucide-react";
import type { FilterState, ItemGroup } from "../../api/types";
import { getResources } from "../../api/api";

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [open, setOpen] = useState(false); // collapsed by default
  const [itemsGroups, setItemsGroups] = useState<ItemGroup[]>([]);
  const [, setError] = useState<string | null>(null);
  const [, setIsLoading] = useState(false);

  const set = (patch: Partial<FilterState>) =>
    onFiltersChange({ ...filters, ...patch });

  // Active filters, excluding the search box (which now lives in the page header).
  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== "search" && v && v !== "all"
  ).length;

  const loadItemsGroup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getResources("/item-groups");
      setItemsGroups(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error loading items:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load items Groups"
      );
      setItemsGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItemsGroup();
  }, []);

  return (
    <Card sx={{ mb: 2.5, overflow: "hidden" }}>
      {/* Header — filter icon toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.25,
          cursor: "pointer",
          borderBottom: open ? "1px solid" : "none",
          borderColor: "divider",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Filters
          </Typography>
          {activeCount > 0 && (
            <Box
              sx={{
                minWidth: 18,
                height: 18,
                px: 0.5,
                borderRadius: 999,
                bgcolor: "primary.main",
                color: "#fff",
                fontSize: "0.65rem",
                fontWeight: 700,
                display: "grid",
                placeItems: "center",
              }}
            >
              {activeCount}
            </Box>
          )}
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          {activeCount > 0 && (
            <Button
              size="small"
              variant="text"
              startIcon={<X size={14} />}
              onClick={onClearFilters}
            >
              Clear
            </Button>
          )}
          <IconButton
            size="small"
            onClick={() => setOpen((o) => !o)}
            aria-label="toggle filters"
            sx={{
              color: open ? "primary.main" : "text.secondary",
              bgcolor: open ? "action.selected" : "transparent",
            }}
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
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)",
            },
          }}
        >
          <Autocomplete
            options={itemsGroups}
            getOptionLabel={(option) => option.itemGroupName || ""}
            value={
              itemsGroups.find((g) => g._id === filters.itemGroupName) || null
            }
            onChange={(_, newValue) =>
              set({ itemGroupName: newValue?._id ?? "" })
            }
            renderInput={(params) => (
              <TextField {...params} label="Item Group" size="small" />
            )}
            isOptionEqualToValue={(option, value) => option._id === value._id}
          />
        </Box>
      </Collapse>
    </Card>
  );
};
