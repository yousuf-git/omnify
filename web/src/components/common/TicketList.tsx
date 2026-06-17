import * as React from "react";
import {
  Box, Card, Chip, IconButton, Tooltip, Typography, Pagination, Divider,
  Select, MenuItem, Button,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  Pencil, Trash2, Copy, Check, ChevronDown, Star, Store as StoreIcon,
  Ticket as TicketIcon, ArrowUpDown, ArrowUp, ArrowDown, Wrench, Headphones,
} from "lucide-react";
import type { Ticket } from "../../api/types";

type M = Map<string, any>;

interface Props {
  records: Ticket[];
  statusMap: M;
  resolutionMap: M;
  issueMap: M;
  supportMap: M;
  storeMap: M;
  stockItemMap: M;
  ratingSort: "" | "asc" | "desc";
  onRatingSortChange: (v: "" | "asc" | "desc") => void;
  onEdit: (t: Ticket) => void;
  onDelete: (t: Ticket) => void;
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

/** ticket status name → MUI chip color */
function statusColor(n: string): "success" | "warning" | "info" | "default" {
  const s = n.toLowerCase();
  if (/resolv|complet|closed|done/.test(s)) return "success";
  if (/progress|assign|hold/.test(s)) return "info";
  if (/open|new|pending/.test(s)) return "warning";
  return "default";
}

/** opening → (resolution if closed, else now), in whole days */
function aging(t: any, resolvedName: string) {
  const open = t.openingDate ? new Date(t.openingDate) : null;
  if (!open || isNaN(open.getTime())) return null;
  const closed = /resolv|complet|closed/.test(resolvedName.toLowerCase());
  const end = closed && t.resolutionDate ? new Date(t.resolutionDate) : new Date();
  const days = Math.max(0, Math.ceil((end.getTime() - open.getTime()) / 86400000));
  return { days, closed };
}

function serialOf(t: any, stockItemMap: M): string {
  const v = t.stockItemId;
  if (!v) return "";
  if (typeof v === "object") return v.serialNo || "";
  if (/^[a-f\d]{24}$/i.test(v)) return stockItemMap.get(v)?.serialNo || "";
  return v;
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
        onClick={async (e) => { e.stopPropagation(); try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); } catch { /* unavailable */ } }}
        sx={{ p: 0.25, color: done ? "success.main" : "text.disabled", "&:hover": { color: "primary.main" } }}
      >
        {done ? <Check size={13} /> : <Copy size={13} />}
      </IconButton>
    </Tooltip>
  );
}

function Stars({ value }: { value: number }) {
  if (!value) return <Typography variant="caption" sx={{ color: "text.disabled" }}>Unrated</Typography>;
  return (
    <Box sx={{ display: "flex", gap: 0.25 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} fill={n <= value ? "#F59E0B" : "none"} color={n <= value ? "#F59E0B" : "#CDD5E0"} />
      ))}
    </Box>
  );
}

function ExpandField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="overline" sx={{ color: "text.disabled", display: "block", lineHeight: 1.4 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value || "—"}</Typography>
    </Box>
  );
}

function Row({ t, idx, statusMap, resolutionMap, issueMap, supportMap, storeMap, stockItemMap, onEdit, onDelete }: { t: any; idx: number } & Omit<Props, "records" | "ratingSort" | "onRatingSortChange">) {
  const [open, setOpen] = React.useState(false);

  const status = name(t.ticketStatusId, statusMap, ["name", "ticketStatusName"]);
  const resolution = name(t.resolutionStatusId, resolutionMap, ["resolutionStatusName", "name"]);
  const issue = name(t.issueTypeId, issueMap, ["issueTypeName", "name"]);
  const support = name(t.supportPersonId, supportMap, ["supportPersonName", "name"]);
  const store = name(t.storeId, storeMap, ["storeName", "name"]);
  const serial = serialOf(t, stockItemMap);
  const rating = Number(t.rating) || 0;
  const age = aging(t, status);
  const isInstall = t.ticketType === "INSTALLATION";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}>
      <Card sx={{ p: 0, transition: "border-color .15s ease", "&:hover": { borderColor: "primary.main" } }}>
        <Box
          sx={{
            display: "grid", gap: { xs: 1.5, md: 2.5 }, alignItems: "center", p: { xs: 1.75, md: 2 },
            gridTemplateColumns: { xs: "1fr", sm: "1.4fr 1fr", lg: "1.5fr 1.3fr 1.2fr 1fr auto" },
          }}
        >
          {/* Ref + type */}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: "text.disabled", display: "block", lineHeight: 1.2 }}>Ticket</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
              <Typography sx={{ fontFamily: '"Space Grotesk", system-ui', fontWeight: 700, fontSize: "0.98rem" }} noWrap>#{t.ticketId ?? "—"}</Typography>
              {t.ticketId && <CopyButton value={String(t.ticketId)} />}
            </Box>
            <Chip
              size="small" variant="outlined"
              icon={isInstall ? <Wrench size={11} /> : <Headphones size={11} />}
              color={isInstall ? "primary" : "secondary"}
              label={isInstall ? "Installation" : "Support"}
              sx={{ mt: 0.25, height: 20 }}
            />
          </Box>

          {/* Status + aging */}
          <Field label="Status">
            {status
              ? <Chip size="small" color={statusColor(status)} label={status} sx={{ maxWidth: "100%" }} />
              : <Typography variant="body2" color="text.disabled">—</Typography>}
            {age && (
              <Typography variant="caption" sx={{ color: age.days > 30 ? "error.main" : age.days > 15 ? "warning.main" : "text.secondary", display: "block", mt: 0.25 }}>
                {age.days}d {age.closed ? "to resolve" : "open"}
              </Typography>
            )}
          </Field>

          {/* Store */}
          <Field label="Store">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <StoreIcon size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
              <Typography variant="body2" noWrap>{store || "—"}</Typography>
            </Box>
            {issue && <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>{issue}</Typography>}
          </Field>

          {/* Rating + opened */}
          <Field label="Rating">
            <Stars value={rating} />
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>Opened {fmtDate(t.openingDate)}</Typography>
          </Field>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 0.25, justifySelf: { lg: "end" } }}>
            <Tooltip title={open ? "Hide detail" : "Show detail"}>
              <IconButton size="small" onClick={() => setOpen((o) => !o)} sx={{ color: open ? "primary.main" : "text.secondary" }}>
                <ChevronDown size={18} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => onEdit(t)}><Pencil size={16} /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(t)}><Trash2 size={16} /></IconButton></Tooltip>
          </Box>
        </Box>

        {/* Expand: full detail */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <Divider />
              <Box sx={{ p: { xs: 1.75, md: 2 }, bgcolor: "action.hover" }}>
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
                  <ExpandField label="Resolution" value={resolution} />
                  <ExpandField label="Issue type" value={issue} />
                  <ExpandField label="Support person" value={support} />
                  <ExpandField label="Call ID" value={t.callId} />
                  <ExpandField label="Serial number" value={serial ? <span style={{ fontFamily: '"Space Mono", monospace' }}>{serial}</span> : ""} />
                  <ExpandField label="Resolution date" value={fmtDate(t.resolutionDate)} />
                  <ExpandField label="Call ID date" value={fmtDate(t.callIdDate)} />
                  <ExpandField label="Rating" value={<Stars value={rating} />} />
                </Box>
                {t.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="overline" sx={{ color: "text.disabled", display: "block" }}>Notes</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>{t.notes}</Typography>
                  </Box>
                )}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer: call id quick ref */}
        {t.callId && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: { xs: 1.75, md: 2 }, py: 1, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="overline" sx={{ color: "text.disabled" }}>Call ID</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{t.callId}</Typography>
            <CopyButton value={t.callId} />
          </Box>
        )}
      </Card>
    </motion.div>
  );
}

export function TicketList(props: Props) {
  const { records, ratingSort, onRatingSortChange } = props;
  const [perPage, setPerPage] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const pageCount = Math.max(1, Math.ceil(records.length / perPage));
  React.useEffect(() => { setPage(1); }, [records.length, perPage]);
  const start = (page - 1) * perPage;
  const pageItems = records.slice(start, start + perPage);

  const cycleSort = () => onRatingSortChange(ratingSort === "asc" ? "desc" : ratingSort === "desc" ? "" : "asc");

  if (records.length === 0) {
    return (
      <Card sx={{ p: 6, textAlign: "center" }}>
        <TicketIcon size={28} style={{ opacity: 0.3 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>No tickets</Typography>
        <Typography variant="body2" color="text.secondary">Adjust your filters, or create a new ticket.</Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>{records.length}</Box> ticket{records.length === 1 ? "" : "s"}
            {" · "}showing {start + 1}–{Math.min(start + perPage, records.length)}
          </Typography>
          <Button
            size="small" variant="outlined" onClick={cycleSort}
            startIcon={ratingSort === "asc" ? <ArrowUp size={14} /> : ratingSort === "desc" ? <ArrowDown size={14} /> : <ArrowUpDown size={14} />}
          >
            Rating{ratingSort === "asc" ? " ↑" : ratingSort === "desc" ? " ↓" : ""}
          </Button>
        </Box>
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
        {pageItems.map((t: any, i) => (
          <Row
            key={t._id || i} t={t} idx={i}
            statusMap={props.statusMap} resolutionMap={props.resolutionMap} issueMap={props.issueMap}
            supportMap={props.supportMap} storeMap={props.storeMap} stockItemMap={props.stockItemMap}
            onEdit={props.onEdit} onDelete={props.onDelete}
          />
        ))}
      </Box>
    </Box>
  );
}
