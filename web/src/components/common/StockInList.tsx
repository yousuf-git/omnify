import * as React from "react";
import {
  Box, Card, Chip, IconButton, Tooltip, Typography, Pagination,
  Dialog, DialogTitle, DialogContent, TextField, InputAdornment, Divider,
  Select, MenuItem,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  Pencil, Trash2, Package, Warehouse as WarehouseIcon, CalendarArrowDown,
  ChevronDown, ScanLine, Search, Calendar, Copy, Check,
} from "lucide-react";
import type { StockIn } from "../../api/types";

type M = Map<string, any>;

interface Props {
  records: StockIn[];
  itemMap: M;
  partyMap: M;
  warehouseMap: M;
  categoryMap: M;
  onEdit: (s: StockIn) => void;
  onDelete: (s: StockIn) => void;
}

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

function name(value: any, map: M, keys: string[]): string {
  if (value === null || value === undefined || value === "") return "";
  const obj = typeof value === "object" ? value : map.get(value);
  if (!obj) return "";
  for (const k of keys) if (obj[k]) return obj[k];
  return "";
}

function fmtDate(value: any): string {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Zip the stock-in's parallel arrays into per-item rows. */
function buildItems(s: any, itemMap: M) {
  const ids: any[] = Array.isArray(s.itemId) ? s.itemId : [];
  const added: any[] = Array.isArray(s.stockAdded) ? s.stockAdded : [];
  const serials: any[] = Array.isArray(s.serialNo) ? s.serialNo : [];
  return ids.map((ref, i) => {
    const item = ref && typeof ref === "object" ? ref : itemMap.get(ref);
    return {
      name: item?.itemName || item?.name || "Unknown item",
      sku: item?.modelNoSKU || "—",
      unit: item?.unit || "",
      qty: Number(added[i]) || 0,
      barcodes: (Array.isArray(serials[i]) ? serials[i] : []).filter(Boolean) as string[],
    };
  });
}

function Field({ label, children, sx }: { label: string; children: React.ReactNode; sx?: any }) {
  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      <Typography variant="overline" sx={{ color: "text.disabled", display: "block", lineHeight: 1.4 }}>{label}</Typography>
      <Box sx={{ mt: 0.25 }}>{children}</Box>
    </Box>
  );
}

function CopyButton({ value }: { value: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <Tooltip title={done ? "Copied" : "Copy"}>
      <IconButton
        size="small"
        onClick={async (e) => {
          e.stopPropagation();
          try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); } catch { /* unavailable */ }
        }}
        sx={{ p: 0.25, color: done ? "success.main" : "text.disabled", "&:hover": { color: "primary.main" } }}
      >
        {done ? <Check size={13} /> : <Copy size={13} />}
      </IconButton>
    </Tooltip>
  );
}

function BarcodeDialog({ open, onClose, itemName, barcodes }: { open: boolean; onClose: () => void; itemName: string; barcodes: string[] }) {
  const [q, setQ] = React.useState("");
  React.useEffect(() => { if (open) setQ(""); }, [open]);
  const filtered = barcodes.filter((b) => b.toLowerCase().includes(q.toLowerCase()));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Serial numbers</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>{itemName} · {barcodes.length} total</Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus fullWidth size="small" placeholder="Search serials…"
          value={q} onChange={(e) => setQ(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={15} /></InputAdornment> } }}
          sx={{ mb: 1.5 }}
        />
        {barcodes.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>No serial numbers recorded.</Typography>
        ) : filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>No match for “{q}”.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, maxHeight: 300, overflowY: "auto" }}>
            {filtered.map((b) => (
              <Box key={b} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, py: 0.85, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
                <ScanLine size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
                <Typography sx={{ fontFamily: '"Space Mono", monospace', fontSize: "0.8rem", flex: 1 }}>{b}</Typography>
                <CopyButton value={b} />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ s, idx, itemMap, partyMap, warehouseMap, categoryMap, onEdit, onDelete }: { s: any; idx: number } & Omit<Props, "records">) {
  const [open, setOpen] = React.useState(false);
  const [barcode, setBarcode] = React.useState<{ name: string; list: string[] } | null>(null);

  const party = name(s.partyId, partyMap, ["partyName", "name"]);
  const category = name(s.stockInCategoryId, categoryMap, ["stockInCategoryName", "name"]);
  const wh = name(s.warehouseId, warehouseMap, ["warehouseName", "name"]);
  const lineItems = buildItems(s, itemMap);
  const totalUnits = lineItems.reduce((sum, it) => sum + it.qty, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}>
      <Card sx={{ p: 0, transition: "border-color .15s ease, box-shadow .15s ease", "&:hover": { borderColor: "primary.main" } }}>
        <Box
          sx={{
            display: "grid", gap: { xs: 1.5, md: 2.5 }, alignItems: "center", p: { xs: 1.75, md: 2 },
            gridTemplateColumns: { xs: "1fr 1fr", sm: "auto 1.5fr 1fr", lg: "84px 1.7fr 0.9fr 1.1fr 1.3fr auto" },
          }}
        >
          {/* Ref */}
          <Box sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}>
            <Typography variant="overline" sx={{ color: "text.disabled", display: "block", lineHeight: 1.2 }}>Ref</Typography>
            <Typography sx={{ fontFamily: '"Space Grotesk", system-ui', fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.1 }}>#{s.stockInId ?? "—"}</Typography>
          </Box>

          {/* Party + category */}
          <Field label="Party">
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{party || "Not specified"}</Typography>
            {category && <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>{category}</Typography>}
          </Field>

          {/* Items */}
          <Field label="Items">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Package size={17} style={{ opacity: 0.7, flexShrink: 0 }} />
              <Typography sx={{ fontFamily: '"Space Grotesk", system-ui', fontWeight: 700, fontSize: "1.05rem", lineHeight: 1 }}>{lineItems.length}</Typography>
            </Box>
            {totalUnits > 0 && <Typography variant="caption" sx={{ color: "text.disabled" }}>+{totalUnits} units</Typography>}
          </Field>

          {/* Dates */}
          <Field label="Dates">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarArrowDown size={12} style={{ flexShrink: 0, opacity: 0.7 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{fmtDate(s.stockInDate)}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
              <Calendar size={11} style={{ flexShrink: 0 }} />
              <Typography variant="caption" noWrap>Doc {fmtDate(s.date)}</Typography>
            </Box>
          </Field>

          {/* Source warehouse */}
          <Field label="Warehouse" sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1", lg: "auto" } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <WarehouseIcon size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
              <Typography variant="body2" noWrap>{wh || "—"}</Typography>
            </Box>
          </Field>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 0.25, justifySelf: { lg: "end" }, gridColumn: { xs: "1 / -1", sm: "1 / -1", lg: "auto" }, justifyContent: { xs: "flex-end", lg: "initial" } }}>
            <Tooltip title={open ? "Hide items" : "Show items"}>
              <IconButton size="small" onClick={() => setOpen((o) => !o)} sx={{ color: open ? "primary.main" : "text.secondary" }}>
                <ChevronDown size={18} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => onEdit(s)}><Pencil size={16} /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(s)}><Trash2 size={16} /></IconButton></Tooltip>
          </Box>
        </Box>

        {/* Expandable: items */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="items"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <Divider />
              <Box sx={{ p: { xs: 1.75, md: 2 }, bgcolor: "action.hover" }}>
                <Typography variant="overline" sx={{ color: "text.secondary" }}>Items received</Typography>
                <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                  {lineItems.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No item details recorded.</Typography>
                  ) : lineItems.map((it, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "grid", gap: 1, alignItems: "center",
                        gridTemplateColumns: { xs: "1fr auto", md: "2.5fr 1fr auto" },
                        p: 1.25, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 1.5,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{it.name}</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>{it.sku}</Typography>
                      </Box>
                      <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <Typography variant="caption" sx={{ color: "text.disabled", display: "block" }}>ADDED</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>+{it.qty}{it.unit ? ` ${it.unit}` : ""}</Typography>
                      </Box>
                      <Chip
                        size="small" clickable icon={<ScanLine size={13} />}
                        color={it.barcodes.length ? "info" : "default"}
                        variant={it.barcodes.length ? "filled" : "outlined"}
                        label={it.barcodes.length ? `${it.barcodes.length} serial${it.barcodes.length === 1 ? "" : "s"}` : "Barcodes"}
                        onClick={() => setBarcode({ name: it.name, list: it.barcodes })}
                        sx={{ justifySelf: { md: "end" } }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer: invoice (copyable) + notes */}
        {(s.invoiceNo || s.notes) && (
          <Box sx={{ px: { xs: 1.75, md: 2 }, py: 1.25, borderTop: "1px solid", borderColor: "divider" }}>
            {s.invoiceNo && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="overline" sx={{ color: "text.disabled" }}>Invoice</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{s.invoiceNo}</Typography>
                <CopyButton value={s.invoiceNo} />
              </Box>
            )}
            {s.notes && (
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: s.invoiceNo ? 0.5 : 0 }}>
                <Typography variant="overline" sx={{ color: "text.disabled", flexShrink: 0 }}>Notes</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>{s.notes}</Typography>
              </Box>
            )}
          </Box>
        )}
      </Card>

      <BarcodeDialog open={!!barcode} onClose={() => setBarcode(null)} itemName={barcode?.name || ""} barcodes={barcode?.list || []} />
    </motion.div>
  );
}

export function StockInList(props: Props) {
  const { records } = props;
  const [perPage, setPerPage] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const pageCount = Math.max(1, Math.ceil(records.length / perPage));
  React.useEffect(() => { setPage(1); }, [records.length, perPage]);
  const start = (page - 1) * perPage;
  const pageItems = records.slice(start, start + perPage);

  if (records.length === 0) {
    return (
      <Card sx={{ p: 6, textAlign: "center" }}>
        <Package size={28} style={{ opacity: 0.3 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>No stock-in records</Typography>
        <Typography variant="body2" color="text.secondary">Adjust your filters, or create a new stock-in.</Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>{records.length}</Box> entr{records.length === 1 ? "y" : "ies"}
          {" · "}showing {start + 1}–{Math.min(start + perPage, records.length)}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>Per page</Typography>
            <Select size="small" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} sx={{ "& .MuiSelect-select": { py: 0.5 }, minWidth: 72 }}>
              {PER_PAGE_OPTIONS.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </Box>
          <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} shape="rounded" color="primary" size="small" showFirstButton showLastButton />
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {pageItems.map((s: any, i) => <Row key={s._id || i} s={s} idx={i} {...props} />)}
      </Box>
    </Box>
  );
}
