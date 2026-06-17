import * as React from "react";
import { Box, Button, Card, Collapse, IconButton, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enGB } from "date-fns/locale/en-GB";
import { SlidersHorizontal, X } from "lucide-react";
import { toDate } from "../../utils/safeDate";
import type { FilterStockIn, Item, Party, StockInCategory } from "../../api/types";

interface StockInFilterPanelProps {
  filters: FilterStockIn;
  onFiltersChange: (filters: FilterStockIn) => void;
  onClearFilters: () => void;
  items: Item[];
  parties: Party[];
  stockInCategories: StockInCategory[];
}

export const StockInFilterPanel = ({
  filters,
  onFiltersChange,
  onClearFilters,
  items,
  parties,
  stockInCategories,
}: StockInFilterPanelProps) => {
  const [open, setOpen] = React.useState(false); // collapsed by default

  const set = (patch: Partial<FilterStockIn>) => onFiltersChange({ ...filters, ...patch });
  const activeCount = Object.entries(filters).filter(([k, v]) => k !== "search" && v).length;

  const auto = <T extends { _id?: string }>(
    label: string, options: T[], getLabel: (o: T) => string, selectedId: string, key: keyof FilterStockIn
  ) => (
    <Autocomplete
      options={options}
      getOptionLabel={getLabel}
      value={options.find((o) => o._id === selectedId) || null}
      onChange={(_, v) => set({ [key]: v?._id || "" } as Partial<FilterStockIn>)}
      isOptionEqualToValue={(o, v) => o._id === v._id}
      renderInput={(params) => <TextField {...params} label={label} size="small" />}
    />
  );

  return (
    <Card sx={{ mb: 2.5, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 2, py: 1.25, cursor: "pointer",
          borderBottom: open ? "1px solid" : "none", borderColor: "divider",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Filters</Typography>
          {activeCount > 0 && (
            <Box sx={{ minWidth: 18, height: 18, px: 0.5, borderRadius: 999, bgcolor: "primary.main", color: "#fff", fontSize: "0.65rem", fontWeight: 700, display: "grid", placeItems: "center" }}>
              {activeCount}
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
          {activeCount > 0 && (
            <Button size="small" variant="text" startIcon={<X size={14} />} onClick={onClearFilters}>Clear</Button>
          )}
          <IconButton
            size="small" onClick={() => setOpen((o) => !o)} aria-label="toggle filters"
            sx={{ color: open ? "primary.main" : "text.secondary", bgcolor: open ? "action.selected" : "transparent" }}
          >
            <SlidersHorizontal size={17} />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={open} timeout={260}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
          <Box
            sx={{
              p: 2, display: "grid", gap: 1.5,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            }}
          >
            {auto("Item", items, (o) => o.itemName, typeof filters.itemId === "string" ? filters.itemId : "", "itemId")}
            {auto("Party", parties, (o) => o.partyName, filters.partyId || "", "partyId")}
            {auto("Stock In Category", stockInCategories, (o) => o.stockInCategoryName, filters.stockInCategoryId || "", "stockInCategoryId")}
            <DatePicker
              label="From date"
              value={toDate(filters.dateFrom)}
              onChange={(d) => set({ dateFrom: d ? d.toISOString() : "" })}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
            <DatePicker
              label="To date"
              value={toDate(filters.dateTo)}
              onChange={(d) => set({ dateTo: d ? d.toISOString() : "" })}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </Box>
        </LocalizationProvider>
      </Collapse>
    </Card>
  );
};
