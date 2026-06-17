import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Card, CardContent, Typography, Grid, Chip, Skeleton, Button, Divider } from "@mui/material";
import {
  Inventory2Outlined, WarningAmberOutlined, MoveToInboxOutlined, OutboxOutlined,
  ConfirmationNumberOutlined, TrendingUpOutlined, ArrowForward, NorthEast,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  itemsAPI, itemStockRecordsAPI, stockInsAPI, stockOutsAPI, ticketsAPI, ticketStatusAPI,
} from "../api/api";
import { useAuth } from "../contexts/AuthContext";
import { useTenantSettings } from "../contexts/TenantSettingsContext";

const LOW_STOCK = 15;
const C = { brand: "#635BFF", out: "#9D4EDD", green: "#00A86B", amber: "#F59E0B", red: "#DF1B41", ink: "#0A2540", muted: "#697386" };

/* ---------- KPI card: gray label, big number, soft tinted icon ---------- */
function Kpi({ icon, label, value, tone, hint, delay = 0 }: { icon: React.ReactNode; label: string; value: string | number; tone: string; hint?: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }} style={{ height: "100%" }}>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Typography variant="overline" sx={{ color: "text.secondary" }}>{label}</Typography>
            <Box sx={{ width: 34, height: 34, borderRadius: "9px", display: "grid", placeItems: "center", bgcolor: `${tone}14`, color: tone }}>
              {icon}
            </Box>
          </Box>
          <Typography sx={{ fontFamily: '"Space Grotesk", system-ui', fontWeight: 700, fontSize: "2rem", lineHeight: 1.1, letterSpacing: "-0.02em", mt: 0.5 }}>
            {value}
          </Typography>
          {hint && <Typography variant="caption" sx={{ color: "text.secondary" }}>{hint}</Typography>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ---------- lightweight SVG donut (no chart lib) ---------- */
function Donut({ segments, total, size = 168, thickness = 20 }: { segments: { value: number; color: string }[]; total: number; size?: number; thickness?: number }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(10,37,64,0.06)" strokeWidth={thickness} />
        {total > 0 && segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * c;
          const el = (
            <motion.circle
              key={i}
              cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={thickness} strokeLinecap="round"
              strokeDasharray={`${dash} ${c - dash}`}
              initial={{ strokeDashoffset: -acc * c + c }}
              animate={{ strokeDashoffset: -acc * c }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
            />
          );
          acc += frac;
          return el;
        })}
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <Box>
          <Typography sx={{ fontFamily: '"Space Grotesk", system-ui', fontWeight: 700, fontSize: "1.6rem", lineHeight: 1 }}>{total}</Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>movements</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { tenantName, formatDate } = useTenantSettings();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ items: any[]; records: any[]; stockIns: any[]; stockOuts: any[]; tickets: any[]; statuses: any[] }>({
    items: [], records: [], stockIns: [], stockOuts: [], tickets: [], statuses: [],
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [items, records, stockIns, stockOuts, tickets, statuses] = await Promise.all([
          itemsAPI.getAll().catch(() => []),
          itemStockRecordsAPI.getAll().catch(() => []),
          stockInsAPI.getAll().catch(() => []),
          stockOutsAPI.getAll().catch(() => []),
          ticketsAPI.getAll().catch(() => []),
          ticketStatusAPI.getAll().catch(() => []),
        ]);
        if (active) setData({
          items: arr(items), records: arr(records), stockIns: arr(stockIns),
          stockOuts: arr(stockOuts), tickets: arr(tickets), statuses: arr(statuses),
        });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => {
    const lowStock = data.records.filter((r) => Number(r.remainingStock) < LOW_STOCK).length;
    const totalUnits = data.records.reduce((s, r) => s + (Number(r.remainingStock) || 0), 0);
    const openTickets = data.tickets.filter((t) => /open|progress/i.test(statusName(t))).length;
    const resolved = data.tickets.filter((t) => /resolv|closed/i.test(statusName(t))).length;
    return {
      items: data.items.length,
      lowStock, totalUnits,
      stockIns: data.stockIns.length, stockOuts: data.stockOuts.length,
      openTickets, resolved, tickets: data.tickets.length,
    };
  }, [data]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    data.tickets.forEach((t) => {
      const n = statusName(t) || "Unknown";
      map.set(n, (map.get(n) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [data.tickets]);

  const topItems = useMemo(
    () => [...data.records].sort((a, b) => Number(b.remainingStock) - Number(a.remainingStock)).slice(0, 5),
    [data.records]
  );

  const movementTotal = stats.stockIns + stats.stockOuts;

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={42} />
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}><Skeleton variant="rounded" height={120} /></Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={320} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>Operations overview</Typography>
          <Typography variant="h3" sx={{ lineHeight: 1.1 }}>
            Welcome back, {user?.name?.split(" ")[0] || "there"}
          </Typography>
        </Box>
        <Chip
          variant="outlined"
          label={tenantName || "Your company"}
          sx={{ fontWeight: 600, borderColor: "divider", color: "text.secondary" }}
        />
      </Box>

      {/* KPIs */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><Kpi icon={<Inventory2Outlined fontSize="small" />} label="Items in catalog" value={stats.items} tone={C.brand} hint="active SKUs" delay={0} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><Kpi icon={<WarningAmberOutlined fontSize="small" />} label="Low-stock items" value={stats.lowStock} tone={C.amber} hint={`below ${LOW_STOCK} units`} delay={0.05} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><Kpi icon={<TrendingUpOutlined fontSize="small" />} label="Units in stock" value={stats.totalUnits.toLocaleString()} tone={C.green} hint="across all records" delay={0.1} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><Kpi icon={<ConfirmationNumberOutlined fontSize="small" />} label="Open tickets" value={stats.openTickets} tone={C.red} hint={`${stats.resolved} resolved`} delay={0.15} /></Grid>
      </Grid>

      {/* Centerpiece */}
      <Grid container spacing={2} sx={{ mt: 0.25 }}>
        {/* Movement donut */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Header title="Stock movement" action={
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button component={RouterLink} to="/StockInPage" size="small" variant="text">Stock-in</Button>
                  <Button component={RouterLink} to="/StockOutPage" size="small" variant="text">Stock-out</Button>
                </Box>
              } />
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4, mt: 1 }}>
                <Donut
                  total={movementTotal}
                  segments={[{ value: stats.stockIns, color: C.brand }, { value: stats.stockOuts, color: C.out }]}
                />
                <Box sx={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Legend icon={<MoveToInboxOutlined fontSize="small" />} color={C.brand} label="Stock-in transactions" value={stats.stockIns} total={movementTotal} />
                  <Divider />
                  <Legend icon={<OutboxOutlined fontSize="small" />} color={C.out} label="Stock-out transactions" value={stats.stockOuts} total={movementTotal} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tickets by status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Header title="Tickets by status" />
              {byStatus.length === 0 ? (
                <Empty>No tickets yet.</Empty>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75, mt: 1.5 }}>
                  {byStatus.slice(0, 5).map((s, i) => {
                    const max = Math.max(...byStatus.map((x) => x.count), 1);
                    return (
                      <Box key={s.name}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>{s.name}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.count}</Typography>
                        </Box>
                        <Box sx={{ height: 6, borderRadius: 999, bgcolor: "action.hover", overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(s.count / max) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.08 }} style={{ height: "100%", background: C.brand, borderRadius: 999 }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top items */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Header title="Top items by stock on hand" />
              <Box sx={{ mt: 1 }}>
                {topItems.length === 0 ? <Empty>No stock records yet.</Empty> : topItems.map((r, i) => {
                  const low = Number(r.remainingStock) < LOW_STOCK;
                  return (
                    <Box key={r._id} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.1, borderBottom: i < topItems.length - 1 ? "1px solid" : "none", borderColor: "divider" }}>
                      <Typography variant="caption" sx={{ color: "text.disabled", width: 18 }}>{i + 1}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>{itemName(r)}</Typography>
                      <Chip size="small" label={`${r.remainingStock ?? 0} in stock`} color={low ? "warning" : "default"} variant={low ? "filled" : "outlined"} />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent tickets */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Header title="Recent tickets" action={
                <Button component={RouterLink} to="/TicketPage" size="small" endIcon={<ArrowForward sx={{ fontSize: 15 }} />}>All</Button>
              } />
              <Box sx={{ mt: 1 }}>
                {data.tickets.slice(0, 5).map((t, i, a) => (
                  <Box key={t._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, py: 1.1, borderBottom: i < a.length - 1 ? "1px solid" : "none", borderColor: "divider" }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>#{t.ticketId || "—"} · {t.ticketType}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>{t.openingDate ? formatDate(t.openingDate) : ""}</Typography>
                    </Box>
                    <Chip size="small" label={statusName(t) || "—"} variant="outlined" />
                  </Box>
                ))}
                {data.tickets.length === 0 && <Empty>No tickets yet.</Empty>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ---------- small presentational helpers ---------- */
function Header({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
      {action}
    </Box>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <Typography color="text.secondary" variant="body2" sx={{ mt: 1.5 }}>{children}</Typography>;
}

function Legend({ icon, color, label, value, total }: { icon: React.ReactNode; color: string; label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: "8px", display: "grid", placeItems: "center", bgcolor: `${color}14`, color }}>{icon}</Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>{label}</Typography>
        </Box>
        <Typography sx={{ fontFamily: '"Space Grotesk", system-ui', fontWeight: 700, fontSize: "1.25rem" }}>{value}</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, color: "text.disabled" }}>
        <NorthEast sx={{ fontSize: 13 }} />
        <Typography variant="caption">{pct}% of total movements</Typography>
      </Box>
    </Box>
  );
}

// helpers tolerant of populated vs id-only references
const arr = (x: any): any[] => (Array.isArray(x) ? x : []);
function statusName(t: any): string {
  return t?.ticketStatusId?.name || t?.ticketStatusId?.ticketStatusName || (typeof t?.ticketStatusId === "string" ? "" : "") || t?.status || "";
}
function itemName(r: any): string {
  return r?.itemId?.itemName || r?.itemName || `Item ${r?.itemId?.itemId ?? ""}`.trim();
}
