import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box, Tabs, Tab, Card, CardContent, TextField, Button, Typography, Grid,
  MenuItem, Snackbar, Alert, Chip, Divider, Stack, IconButton, Tooltip,
} from "@mui/material";
import {
  StorefrontOutlined, PublicOutlined, TuneOutlined, GroupOutlined, CheckCircle, RemoveCircleOutline,
} from "@mui/icons-material";
import { Plus, ArrowRight } from "lucide-react";
import { tenantAPI } from "../api/api";
import { useTenantSettings } from "../contexts/TenantSettingsContext";
import { EditItemDialog } from "../components/common/EditItemDialog";

const currencies = ["INR", "USD", "EUR", "GBP", "AED", "AUD", "CAD", "SGD"];
const dateFormats = ["dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd MMM yyyy"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type MasterType =
  | "city" | "state" | "itemGroup" | "stockInCategory" | "stockOutCategory"
  | "ticketStatus" | "resolutionStatus" | "issueType" | "deliveryStatus"
  | "installationStatus" | "logisticsProviderCategory" | "assignedTo";

const masterLinks: { label: string; to: string; type: MasterType }[] = [
  { label: "Cities", to: "/CityPage", type: "city" },
  { label: "States", to: "/StatePage", type: "state" },
  { label: "Item Groups", to: "/ItemGroupPage", type: "itemGroup" },
  { label: "Stock In Categories", to: "/StockInCategoryPage", type: "stockInCategory" },
  { label: "Stock Out Categories", to: "/StockOutCategoryPage", type: "stockOutCategory" },
  { label: "Ticket Status", to: "/TicketStatusPage", type: "ticketStatus" },
  { label: "Resolution Status", to: "/ResolutionStatusPage", type: "resolutionStatus" },
  { label: "Issue Types", to: "/IssueTypePage", type: "issueType" },
  { label: "Delivery Status", to: "/DeliveryStatusPage", type: "deliveryStatus" },
  { label: "Installation Status", to: "/InstallationStatusPage", type: "installationStatus" },
  { label: "Logistics Providers", to: "/LogisticsProviderCategoryPage", type: "logisticsProviderCategory" },
  { label: "Assigned To", to: "/AssignedToPage", type: "assignedTo" },
];

const roleMatrix = [
  { role: "Admin", access: ["Full access", "Settings & branding", "Manage users", "All inventory & tickets"] },
  { role: "Manager", access: ["All inventory & tickets", "Manage master data", "No settings / users"] },
  { role: "Staff", access: ["Create & edit stock and tickets", "No master data", "No deletes / settings"] },
  { role: "Viewer", access: ["Read-only across the company"] },
];

export default function SettingsPage() {
  const { settings, tenantName, refresh } = useTenantSettings();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({ open: false, msg: "", sev: "success" });
  const [createType, setCreateType] = useState<MasterType | null>(null);

  const [profile, setProfile] = useState(settings.profile);
  const [branding, setBranding] = useState(settings.branding);
  const [localization, setLocalization] = useState(settings.localization);
  const [name, setName] = useState(tenantName);

  useEffect(() => {
    setProfile(settings.profile);
    setBranding(settings.branding);
    setLocalization(settings.localization);
    setName(tenantName);
  }, [settings, tenantName]);

  const save = async (payload: any, label: string) => {
    setSaving(true);
    try {
      await tenantAPI.updateSettings(payload);
      await refresh();
      setToast({ open: true, msg: `${label} saved`, sev: "success" });
    } catch (e: any) {
      setToast({ open: true, msg: e?.message || "Could not save", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className="flex flex-col">
      <Box sx={{ display: "flex", alignItems: "stretch", gap: 1.5, mb: 2.5 }}>
        <Box sx={{ width: "3px", borderRadius: "2px", bgcolor: "primary.main" }} />
        <Box>
          <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Settings</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
            Configure {tenantName || "your company"}'s profile, localization, data and people.
          </Typography>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
        <Tab icon={<StorefrontOutlined fontSize="small" />} iconPosition="start" label="Company & branding" />
        <Tab icon={<PublicOutlined fontSize="small" />} iconPosition="start" label="Localization & finance" />
        <Tab icon={<TuneOutlined fontSize="small" />} iconPosition="start" label="Master data" />
        <Tab icon={<GroupOutlined fontSize="small" />} iconPosition="start" label="Users & roles" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Company name" value={name} onChange={(e) => setName(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Contact email" value={profile.contactEmail} onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Brand color (hex)" value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} placeholder="#635BFF" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline minRows={2} label="Address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" disabled={saving} onClick={() => save({ tenantName: name, profile, branding }, "Company profile")}>
                Save changes
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField select fullWidth label="Currency" value={localization.currency} onChange={(e) => setLocalization({ ...localization, currency: e.target.value })}>
                  {currencies.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField select fullWidth label="Date format" value={localization.dateFormat} onChange={(e) => setLocalization({ ...localization, dateFormat: e.target.value })}>
                  {dateFormats.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Timezone" value={localization.timezone} onChange={(e) => setLocalization({ ...localization, timezone: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField select fullWidth label="Financial year starts" value={localization.fyStartMonth} onChange={(e) => setLocalization({ ...localization, fyStartMonth: Number(e.target.value) })}>
                  {months.map((m, i) => <MenuItem key={m} value={i + 1}>{m}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
              The financial-year start month drives the automatic yearly stock rollover.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" disabled={saving} onClick={() => save({ localization }, "Localization")}>
                Save changes
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Master & configuration data</Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mb: 2.5 }}>
              These lists are specific to your company. Manage each from its page.
            </Typography>
            <Grid container spacing={1.5}>
              {masterLinks.map((m) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={m.to}>
                  <Box
                    sx={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                      px: 1.5, py: 0.75, border: "1px solid", borderColor: "divider", borderRadius: 1.5,
                      transition: "border-color .15s ease",
                      "&:hover": { borderColor: "primary.main" },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 0 }} noWrap>{m.label}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
                      <Tooltip title={`Add ${m.label}`}>
                        <IconButton size="small" color="primary" onClick={() => setCreateType(m.type)}>
                          <Plus size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={`Open ${m.label}`}>
                        <IconButton size="small" onClick={() => navigate(m.to)} sx={{ color: "text.secondary" }}>
                          <ArrowRight size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Stack spacing={2.5}>
          <Card>
            <CardContent sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Team members</Typography>
                <Typography color="text.secondary" variant="body2">Create and manage the people in your company.</Typography>
              </Box>
              <Button component={RouterLink} to="/UserManagementPage" variant="contained">Manage users</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Roles & access</Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                Roles are fixed. Here's what each can do.
              </Typography>
              <Stack divider={<Divider />} spacing={2}>
                {roleMatrix.map((r) => (
                  <Box key={r.role} sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <Chip label={r.role} color="primary" variant="outlined" sx={{ minWidth: 90, fontWeight: 600 }} />
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {r.access.map((a) => (
                        <Box key={a} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {a.startsWith("No ") ? <RemoveCircleOutline sx={{ fontSize: 16, color: "text.disabled" }} /> : <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />}
                          <Typography variant="body2" color="text.secondary">{a}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Instant-create overlay for any master-data entity */}
      <EditItemDialog
        open={createType !== null}
        type={createType}
        item={null}
        onClose={() => setCreateType(null)}
        onSuccess={() => setToast({ open: true, msg: "Created", sev: "success" })}
      />

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.sev} variant="filled" onClose={() => setToast({ ...toast, open: false })}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
