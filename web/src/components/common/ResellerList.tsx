import * as React from "react";
import {
  Box, Card, Chip, IconButton, Tooltip, Typography, Pagination, Select, MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";
import { Pencil, Trash2, Store, MapPin, FileText, Copy, Check } from "lucide-react";
import type { Reseller } from "../../api/types";

type M = Map<string, any>;

interface Props {
  records: Reseller[];
  cityMap: M;
  stateMap: M;
  onEdit: (r: Reseller) => void;
  onDelete: (r: Reseller) => void;
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

function CopyButton({ value }: { value: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <Tooltip title={done ? "Copied" : "Copy"}>
      <IconButton
        size="small"
        onClick={async (e) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(value);
            setDone(true);
            setTimeout(() => setDone(false), 1200);
          } catch { /* clipboard unavailable */ }
        }}
        sx={{ p: 0.25, color: done ? "success.main" : "text.disabled", "&:hover": { color: "primary.main" } }}
      >
        {done ? <Check size={13} /> : <Copy size={13} />}
      </IconButton>
    </Tooltip>
  );
}

function Row({ r, idx, cityMap, stateMap, onEdit, onDelete }: { r: any; idx: number } & Omit<Props, "records">) {
  const city = name(r.cityId, cityMap, ["cityName", "name"]);
  const state = name(r.stateId, stateMap, ["stateName", "name"]);
  const location = [city, state].filter(Boolean).join(" · ");

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}>
      <Card sx={{ p: 0, transition: "border-color .15s ease, box-shadow .15s ease", "&:hover": { borderColor: "primary.main" } }}>
        <Box
          sx={{
            display: "grid", gap: { xs: 1.5, md: 2.5 }, alignItems: "center", p: { xs: 1.75, md: 2 },
            gridTemplateColumns: { xs: "1fr auto", sm: "1.6fr 1.2fr auto", lg: "1.8fr 1.2fr 1.6fr auto" },
          }}
        >
          {/* Reseller name + GSTN */}
          <Field label="Reseller">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Store size={16} style={{ opacity: 0.65, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{r.resellerName || "Unnamed reseller"}</Typography>
            </Box>
            {r.gstn && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mt: 0.25 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"Space Mono", monospace' }} noWrap>{r.gstn}</Typography>
                <CopyButton value={r.gstn} />
              </Box>
            )}
          </Field>

          {/* City · State */}
          <Field label="Location">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <MapPin size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
              <Typography variant="body2" noWrap>{location || "—"}</Typography>
            </Box>
          </Field>

          {/* Status */}
          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <Field label="Status">
              <Chip
                size="small"
                label={r.isActive ? "Active" : "Inactive"}
                color={r.isActive ? "success" : "error"}
                variant="outlined"
              />
            </Field>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 0.25, alignItems: "center", justifySelf: "end" }}>
            <Box sx={{ display: { xs: "block", lg: "none" }, mr: 0.5 }}>
              <Chip
                size="small"
                label={r.isActive ? "Active" : "Inactive"}
                color={r.isActive ? "success" : "error"}
                variant="outlined"
              />
            </Box>
            <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => onEdit(r)}><Pencil size={16} /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(r)}><Trash2 size={16} /></IconButton></Tooltip>
          </Box>
        </Box>

        {/* Footer: address */}
        {(r.address || r.shippingAddress) && (
          <Box sx={{ px: { xs: 1.75, md: 2 }, py: 1.25, borderTop: "1px solid", borderColor: "divider", display: "flex", alignItems: "baseline", gap: 1 }}>
            <FileText size={13} style={{ opacity: 0.45, flexShrink: 0, position: "relative", top: 2 }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>{r.address || r.shippingAddress}</Typography>
          </Box>
        )}
      </Card>
    </motion.div>
  );
}

export function ResellerList(props: Props) {
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
        <Store size={28} style={{ opacity: 0.3 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>No resellers</Typography>
        <Typography variant="body2" color="text.secondary">Adjust your search, or create a new reseller.</Typography>
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
        {pageItems.map((r: any, i) => <Row key={r._id || i} r={r} idx={i} {...props} />)}
      </Box>
    </Box>
  );
}
