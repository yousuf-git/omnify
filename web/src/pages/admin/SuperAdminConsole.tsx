import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, AppBar, Toolbar, Typography, Button, Card, CardContent, Grid, Avatar,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Skeleton, Tooltip,
} from "@mui/material";
import {
  Logout, AddBusinessOutlined, ApartmentOutlined, GroupOutlined, ToggleOnOutlined,
  CheckCircleOutline, BlockOutlined, AddOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { adminTenantsAPI } from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

interface TenantRow {
  _id: string; tenantName: string; slug: string; isActive: boolean; userCount?: number; createdAt?: string;
}

export default function SuperAdminConsole() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [overview, setOverview] = useState<any>({ totalTenants: 0, activeTenants: 0, disabledTenants: 0, totalUsers: 0 });
  const [openCreate, setOpenCreate] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({ open: false, msg: "", sev: "success" });

  const load = async () => {
    setLoading(true);
    try {
      const [list, ov] = await Promise.all([adminTenantsAPI.list(), adminTenantsAPI.overview()]);
      setTenants(Array.isArray(list) ? list : []);
      setOverview(ov || {});
    } catch (e: any) {
      setToast({ open: true, msg: e?.message || "Failed to load", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id: string) => {
    try {
      await adminTenantsAPI.toggle(id);
      await load();
    } catch (e: any) {
      setToast({ open: true, msg: e?.message || "Failed to update", sev: "error" });
    }
  };

  const doLogout = async () => { await logout(); navigate("/login"); };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#0A2540" }}>
        <Toolbar sx={{ gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
            <Avatar variant="rounded" sx={{ bgcolor: "#635BFF", width: 34, height: 34, fontWeight: 800 }}>O</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, lineHeight: 1.1 }}>Omnify</Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>Platform console</Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mr: 1 }}>{user?.name}</Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={doLogout}>Sign out</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Companies</Typography>
            <Typography color="text.secondary">Provision and manage tenant companies.</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddBusinessOutlined />} onClick={() => setOpenCreate(true)}>
            New company
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><OverviewCard icon={<ApartmentOutlined />} label="Total companies" value={overview.totalTenants ?? 0} tone="#635BFF" /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><OverviewCard icon={<CheckCircleOutline />} label="Active" value={overview.activeTenants ?? 0} tone="#00A86B" /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><OverviewCard icon={<BlockOutlined />} label="Disabled" value={overview.disabledTenants ?? 0} tone="#DF1B41" /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><OverviewCard icon={<GroupOutlined />} label="Total users" value={overview.totalUsers ?? 0} tone="#9D4EDD" /></Grid>
        </Grid>

        <Card sx={{ mt: 2 }}>
          <CardContent>
            {loading ? (
              <Skeleton variant="rounded" height={240} />
            ) : tenants.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <ApartmentOutlined sx={{ fontSize: 40, color: "text.disabled" }} />
                <Typography sx={{ mt: 1, fontWeight: 600 }}>No companies yet</Typography>
                <Typography color="text.secondary" variant="body2">Create your first company to get started.</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell align="center">Users</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tenants.map((t) => (
                    <TableRow key={t._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{t.tenantName}</TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{t.slug}</Typography></TableCell>
                      <TableCell align="center">{t.userCount ?? 0}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={t.isActive ? "Active" : "Disabled"} color={t.isActive ? "success" : "default"} variant={t.isActive ? "filled" : "outlined"} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t.isActive ? "Disable company" : "Enable company"}>
                          <IconButton size="small" onClick={() => toggle(t._id)}><ToggleOnOutlined color={t.isActive ? "success" : "disabled"} /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Box>

      <CreateCompanyDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={(msg) => { setOpenCreate(false); setToast({ open: true, msg, sev: "success" }); load(); }}
        onError={(msg) => setToast({ open: true, msg, sev: "error" })}
      />

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.sev} variant="filled" onClose={() => setToast({ ...toast, open: false })}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

function OverviewCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar variant="rounded" sx={{ bgcolor: `${tone}1A`, color: tone, width: 46, height: 46 }}>{icon}</Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreateCompanyDialog({ open, onClose, onCreated, onError }: {
  open: boolean; onClose: () => void; onCreated: (msg: string) => void; onError: (msg: string) => void;
}) {
  const [form, setForm] = useState({ tenantName: "", slug: "", adminName: "", adminEmail: "", adminPassword: "" });
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setSaving(true);
    try {
      await adminTenantsAPI.create(form);
      setForm({ tenantName: "", slug: "", adminName: "", adminEmail: "", adminPassword: "" });
      onCreated(`Company "${form.tenantName}" created`);
    } catch (e: any) {
      onError(e?.message || "Failed to create company");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Provision a new company</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Creates the company and its first admin. The admin signs in and invites their own team.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Company name" value={form.tenantName} onChange={set("tenantName")} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Slug (optional)" value={form.slug} onChange={set("slug")} placeholder="auto from name" /></Grid>
          <Grid size={{ xs: 12 }}><TextField fullWidth label="Admin name" value={form.adminName} onChange={set("adminName")} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Admin email" type="email" value={form.adminEmail} onChange={set("adminEmail")} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Admin password" type="password" value={form.adminPassword} onChange={set("adminPassword")} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" startIcon={<AddOutlined />} disabled={saving} onClick={submit}>Create company</Button>
      </DialogActions>
    </Dialog>
  );
}
