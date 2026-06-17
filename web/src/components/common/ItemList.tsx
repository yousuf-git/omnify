import * as React from "react";
import {
  Box, Card, Chip, IconButton, Tooltip, Typography, Pagination, Select, MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";
import { Pencil, Trash2, Package, Layers, Wrench, ScanLine } from "lucide-react";
import type { Item } from "../../api/types";

type M = Map<any, any>;

interface Props {
  records: Item[];
  itemGroupMap: M;
  onEdit: (i: Item) => void;
  onDelete: (i: Item) => void;
}

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

function name(value: any, map: M, keys: string[]): string {
  if (value === null || value === undefined || value === "") return "";
  const obj = typeof value === "object" ? value : map.get(value);
  if (!obj) return "";
  for (const k of keys) if (obj[k]) return obj[k];
  return "";
}

function Field({ label, children, sx }: { label: string; children: React.ReactNode; sx?: any }) {
  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      <Typography variant="overline" sx={{ color: "text.disabled", display: "block", lineHeight: 1.4 }}>{label}</Typography>
      <Box sx={{ mt: 0.25 }}>{children}</Box>
    </Box>
  );
}

function Row({ it, idx, itemGroupMap, onEdit, onDelete }: { it: any; idx: number } & Omit<Props, "records">) {
  const group = name(it.itemGroupId, itemGroupMap, ["itemGroupName", "name"]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}>
      <Card sx={{ p: 0, transition: "border-color .15s ease, box-shadow .15s ease", "&:hover": { borderColor: "primary.main" } }}>
        <Box
          sx={{
            display: "grid", gap: { xs: 1.5, md: 2.5 }, alignItems: "center", p: { xs: 1.75, md: 2 },
            gridTemplateColumns: { xs: "1fr auto", sm: "1.8fr 1.2fr auto", lg: "1.8fr 1.2fr 0.7fr 1.4fr auto" },
          }}
        >
          {/* Item name + SKU */}
          <Field label="Item">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Package size={16} style={{ opacity: 0.65, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{it.itemName || "Unnamed item"}</Typography>
            </Box>
            {it.modelNoSKU && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                <ScanLine size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"Space Mono", monospace' }} noWrap>{it.modelNoSKU}</Typography>
              </Box>
            )}
          </Field>

          {/* Item Group */}
          <Field label="Item group">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Layers size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
              <Typography variant="body2" noWrap>{group || "—"}</Typography>
            </Box>
          </Field>

          {/* Unit */}
          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <Field label="Unit">
              <Typography variant="body2" noWrap>{it.unit || "—"}</Typography>
            </Field>
          </Box>

          {/* Capability chips + status */}
          <Box sx={{ display: { xs: "none", lg: "flex" }, flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
            {it.requiresInstallation && (
              <Chip size="small" icon={<Wrench size={12} />} variant="outlined" label="Install" />
            )}
            {it.requiresSerialNumberManagement && (
              <Chip size="small" icon={<ScanLine size={12} />} variant="outlined" color="info" label="Serial" />
            )}
            <Chip
              size="small"
              label={it.isActive ? "Active" : "Inactive"}
              color={it.isActive ? "success" : "error"}
              variant="outlined"
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 0.25, alignItems: "center", justifySelf: "end" }}>
            <Box sx={{ display: { xs: "block", lg: "none" }, mr: 0.5 }}>
              <Chip
                size="small"
                label={it.isActive ? "Active" : "Inactive"}
                color={it.isActive ? "success" : "error"}
                variant="outlined"
              />
            </Box>
            <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => onEdit(it)}><Pencil size={16} /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(it)}><Trash2 size={16} /></IconButton></Tooltip>
          </Box>
        </Box>

        {/* Footer: capability chips on small screens */}
        <Box sx={{ display: { xs: "flex", lg: "none" }, flexWrap: "wrap", gap: 0.5, px: { xs: 1.75, md: 2 }, py: 1.25, borderTop: "1px solid", borderColor: "divider" }}>
          {it.unit && <Chip size="small" variant="outlined" label={`Unit: ${it.unit}`} />}
          {it.requiresInstallation && <Chip size="small" icon={<Wrench size={12} />} variant="outlined" label="Install" />}
          {it.requiresSerialNumberManagement && <Chip size="small" icon={<ScanLine size={12} />} variant="outlined" color="info" label="Serial" />}
        </Box>
      </Card>
    </motion.div>
  );
}

export function ItemList(props: Props) {
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
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>No items</Typography>
        <Typography variant="body2" color="text.secondary">Adjust your filters, or create a new item.</Typography>
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
            <Select
              size="small" value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              sx={{ "& .MuiSelect-select": { py: 0.5 }, minWidth: 72 }}
            >
              {PER_PAGE_OPTIONS.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </Box>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, p) => setPage(p)}
            shape="rounded"
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {pageItems.map((it: any, i) => <Row key={it._id || i} it={it} idx={i} {...props} />)}
      </Box>
    </Box>
  );
}
