import * as React from "react";
import {
  Box, Card, Chip, IconButton, Tooltip, Typography, Pagination, Select, MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";
import { Pencil, Trash2, Headset, Phone, Building, MapPin, Star, Copy, Check } from "lucide-react";
import type { SupportPerson } from "../../api/types";

type M = Map<string, any>;

interface Props {
  records: SupportPerson[];
  agencyMap: M;
  cityMap: M;
  stateMap: M;
  // personId -> { avg, count } computed from their tickets' ratings
  ratingMap?: Map<string, { avg: number; count: number }>;
  onEdit: (t: SupportPerson) => void;
  onDelete: (t: SupportPerson) => void;
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

/** 1–5 star row, filled up to `value`. */
function Stars({ value }: { value: number }) {
  const v = Math.round(value);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          fill={n <= v ? "#F59E0B" : "none"}
          color={n <= v ? "#F59E0B" : "currentColor"}
          style={{ opacity: n <= v ? 1 : 0.3 }}
        />
      ))}
    </Box>
  );
}

function Row({ t, idx, agencyMap, cityMap, stateMap, ratingMap, onEdit, onDelete }: { t: any; idx: number } & Omit<Props, "records">) {
  const agency = name(t.agencyId, agencyMap, ["agencyName", "name"]);
  const city = name(t.cityId, cityMap, ["cityName", "name"]);
  const state = name(t.stateId, stateMap, ["stateName", "name"]);
  const location = [city, state].filter(Boolean).join(" · ");
  const r = ratingMap?.get(String(t._id));
  const hasRating = !!r && r.count > 0;
  const avg = r?.avg || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}>
      <Card sx={{ p: 0, transition: "border-color .15s ease, box-shadow .15s ease", "&:hover": { borderColor: "primary.main" } }}>
        <Box
          sx={{
            display: "grid", gap: { xs: 1.5, md: 2.5 }, alignItems: "center", p: { xs: 1.75, md: 2 },
            gridTemplateColumns: { xs: "1fr auto", sm: "1.6fr 1.2fr auto", lg: "1.7fr 1.1fr 1.4fr auto" },
          }}
        >
          {/* Name + phone */}
          <Field label="Support person">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Headset size={16} style={{ opacity: 0.65, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{t.supportPersonName || "Unnamed"}</Typography>
            </Box>
            {t.supportPersonNumber && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                <Phone size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"Space Mono", monospace' }} noWrap>{t.supportPersonNumber}</Typography>
                <CopyButton value={String(t.supportPersonNumber)} />
              </Box>
            )}
          </Field>

          {/* Agency */}
          <Field label="Agency">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Building size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
              <Typography variant="body2" noWrap>{agency || "—"}</Typography>
            </Box>
          </Field>

          {/* City · State + rating */}
          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <Field label="Location">
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <MapPin size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
                <Typography variant="body2" noWrap>{location || "—"}</Typography>
              </Box>
              <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                {hasRating ? (
                  <>
                    <Stars value={avg} />
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>{avg.toFixed(1)} ({r!.count})</Typography>
                  </>
                ) : (
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>No ratings</Typography>
                )}
              </Box>
            </Field>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 0.25, alignItems: "center", justifySelf: "end" }}>
            <Box sx={{ display: { xs: "block", lg: "none" }, mr: 0.5 }}>
              <Chip
                size="small"
                label={t.isActive ? "Active" : "Inactive"}
                color={t.isActive ? "success" : "error"}
                variant="outlined"
              />
            </Box>
            <Box sx={{ display: { xs: "none", lg: "block" }, mr: 0.5 }}>
              <Chip
                size="small"
                label={t.isActive ? "Active" : "Inactive"}
                color={t.isActive ? "success" : "error"}
                variant="outlined"
              />
            </Box>
            <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => onEdit(t)}><Pencil size={16} /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(t)}><Trash2 size={16} /></IconButton></Tooltip>
          </Box>
        </Box>

        {/* Footer: location + rating on small screens */}
        <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center", gap: 1.5, flexWrap: "wrap", px: { xs: 1.75, md: 2 }, py: 1.25, borderTop: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <MapPin size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>{location || "—"}</Typography>
          </Box>
          {hasRating ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Stars value={avg} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>{avg.toFixed(1)} ({r!.count})</Typography>
            </Box>
          ) : (
            <Typography variant="caption" sx={{ color: "text.disabled" }}>No ratings</Typography>
          )}
        </Box>
      </Card>
    </motion.div>
  );
}

export function SupportPersonList(props: Props) {
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
        <Headset size={28} style={{ opacity: 0.3 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>No support persons</Typography>
        <Typography variant="body2" color="text.secondary">Adjust your filters, or create a new support person.</Typography>
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
        {pageItems.map((t: any, i) => <Row key={t._id || i} t={t} idx={i} {...props} />)}
      </Box>
    </Box>
  );
}
