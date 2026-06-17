import * as React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import { Box, Button, Card, Collapse, Typography, IconButton, Tooltip } from "@mui/material";
import { AlertTriangle, Copy, Check, RefreshCw, ChevronDown, Home } from "lucide-react";

/**
 * Friendly fallback for any uncaught render/loader error in a route subtree.
 * Shows a calm message (no raw stack on the surface), logs the real error to the
 * console for devs, and lets the user copy technical details to share with support.
 */
export default function RouteError() {
  const error = useRouteError() as any;
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const message: string =
    error?.message || error?.statusText || (typeof error === "string" ? error : "Unexpected error");
  const details = [
    `Time: ${new Date().toISOString()}`,
    `Path: ${typeof window !== "undefined" ? window.location.pathname : ""}`,
    `Message: ${message}`,
    error?.stack ? `Stack:\n${error.stack}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  React.useEffect(() => {
    // Real error goes to the console for developers — never onto the UI surface.
    console.error("[RouteError]", error);
  }, [error]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center", p: 3 }}>
      <Card sx={{ maxWidth: 520, width: "100%", p: { xs: 3, md: 4 }, textAlign: "center" }}>
        <Box sx={{ width: 48, height: 48, borderRadius: "12px", mx: "auto", display: "grid", placeItems: "center", bgcolor: "warning.light", color: "warning.dark" }}>
          <AlertTriangle size={24} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 2 }}>Something went wrong</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
          This page hit an unexpected error. You can retry, or copy the details below to share with support.
        </Typography>

        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 3, flexWrap: "wrap" }}>
          <Button variant="contained" startIcon={<RefreshCw size={16} />} onClick={() => window.location.reload()}>
            Reload
          </Button>
          <Button variant="outlined" startIcon={<Home size={16} />} onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Button size="small" variant="text" onClick={() => setOpen((o) => !o)}
            endIcon={<ChevronDown size={15} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />}>
            Technical details
          </Button>
          <Collapse in={open}>
            <Box sx={{ position: "relative", mt: 1, textAlign: "left", bgcolor: "action.hover", border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: 1.5, maxHeight: 220, overflow: "auto" }}>
              <Tooltip title={copied ? "Copied" : "Copy"}>
                <IconButton size="small" onClick={copy} sx={{ position: "absolute", top: 4, right: 4, color: copied ? "success.main" : "text.disabled" }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </IconButton>
              </Tooltip>
              <Typography component="pre" sx={{ m: 0, fontFamily: '"Space Mono", monospace', fontSize: "0.72rem", whiteSpace: "pre-wrap", color: "text.secondary" }}>
                {details}
              </Typography>
            </Box>
          </Collapse>
        </Box>
      </Card>
    </Box>
  );
}
