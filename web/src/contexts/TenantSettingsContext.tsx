import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { format as formatDateFns } from "date-fns";
import { tenantAPI } from "../api/api";
import { useAuth } from "./AuthContext";
import { isSandbox, getSandboxUser } from "../sandbox/sandboxMode";

export interface TenantSettings {
  profile: { companyName: string; contactEmail: string; phone: string; address: string; logoKey: string };
  branding: { primaryColor: string };
  localization: { currency: string; dateFormat: string; timezone: string; fyStartMonth: number };
}

const DEFAULTS: TenantSettings = {
  profile: { companyName: "", contactEmail: "", phone: "", address: "", logoKey: "" },
  branding: { primaryColor: "" },
  localization: { currency: "USD", dateFormat: "MM/dd/yyyy", timezone: "America/New_York", fyStartMonth: 1 },
};

interface Ctx {
  tenantName: string;
  settings: TenantSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  formatCurrency: (n: number) => string;
  formatDate: (d: string | number | Date) => string;
}

const TenantSettingsContext = createContext<Ctx | undefined>(undefined);

export const useTenantSettings = () => {
  const ctx = useContext(TenantSettingsContext);
  if (!ctx) throw new Error("useTenantSettings must be used within TenantSettingsProvider");
  return ctx;
};

export const TenantSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tenantName, setTenantName] = useState("");
  const [settings, setSettings] = useState<TenantSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (isSandbox()) {
        const su = getSandboxUser();
        setTenantName(su?.company || "Sandbox Co.");
        setSettings({ ...DEFAULTS, profile: { ...DEFAULTS.profile, companyName: su?.company || "Sandbox Co." } });
        return;
      }
      const t: any = await tenantAPI.getCurrent();
      if (t && t._id) {
        setTenantName(t.tenantName || "");
        setSettings({
          profile: { ...DEFAULTS.profile, ...(t.settings?.profile || {}) },
          branding: { ...DEFAULTS.branding, ...(t.settings?.branding || {}) },
          localization: { ...DEFAULTS.localization, ...(t.settings?.localization || {}) },
        });
      }
    } catch {
      setSettings(DEFAULTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) refresh();
    else setLoading(false);
  }, [user, refresh]);

  const formatCurrency = useCallback(
    (n: number) => {
      try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency: settings.localization.currency }).format(n);
      } catch {
        return `${settings.localization.currency} ${n.toLocaleString()}`;
      }
    },
    [settings.localization.currency]
  );

  const formatDate = useCallback(
    (d: string | number | Date) => {
      try {
        return formatDateFns(new Date(d), settings.localization.dateFormat);
      } catch {
        return String(d);
      }
    },
    [settings.localization.dateFormat]
  );

  return (
    <TenantSettingsContext.Provider value={{ tenantName, settings, loading, refresh, formatCurrency, formatDate }}>
      {children}
    </TenantSettingsContext.Provider>
  );
};

export default TenantSettingsProvider;
