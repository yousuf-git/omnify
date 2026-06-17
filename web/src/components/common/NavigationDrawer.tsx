import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";
import AllInboxOutlinedIcon from "@mui/icons-material/AllInboxOutlined";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BugReportIcon from "@mui/icons-material/BugReport";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import DownloadingOutlinedIcon from "@mui/icons-material/DownloadingOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PostAddOutlinedIcon from "@mui/icons-material/PostAddOutlined";
import PublishedWithChangesOutlinedIcon from "@mui/icons-material/PublishedWithChangesOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ThreePOutlinedIcon from "@mui/icons-material/ThreePOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import LocalShippingTwoToneIcon from "@mui/icons-material/LocalShippingOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import MuiAppBar, {
  type AppBarProps as MuiAppBarProps,
} from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MuiDrawer from "@mui/material/Drawer";
import Tooltip from "@mui/material/Tooltip";
import {
  styled,
  type CSSObject,
  type Theme,
} from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";

import { AccountCircle, Logout } from "@mui/icons-material";
import { Chip } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 230;
type Role = string;
type Item = { icon: React.ElementType; text: string; link: string; allowedRoles?: Role[] };
type Group = { key: string; title: string; icon: React.ElementType; items: Item[] };

// Surface palette for the sidebar (deep navy).
const NAV_BG = "#0A2540";
const NAV_BG_DARK = "#0B1B2E";
const ACCENT = "#635BFF";

// Primary destinations — always visible, flat.
const PRIMARY: Item[] = [
  { icon: SpaceDashboardOutlinedIcon, text: "Dashboard", link: "/dashboard", allowedRoles: ["admin", "manager", "staff", "viewer"] },
  { icon: Inventory2OutlinedIcon, text: "Stock In", link: "/StockInPage", allowedRoles: ["admin", "manager", "staff", "viewer"] },
  { icon: InventoryOutlinedIcon, text: "Stock Out", link: "/StockOutPage", allowedRoles: ["admin", "manager", "staff", "viewer"] },
  { icon: ConfirmationNumberOutlinedIcon, text: "Tickets", link: "/TicketPage", allowedRoles: ["admin", "manager", "staff", "viewer"] },
];

// Collapsible groups, ordered by operational frequency (most-used first → admin last).
const GROUPS: Group[] = [
  {
    key: "inventory",
    title: "Inventory",
    icon: CategoryOutlinedIcon,
    items: [
      { icon: FormatListBulletedOutlinedIcon, text: "Items", link: "/ItemPage" },
      { icon: CategoryOutlinedIcon, text: "Item Groups", link: "/ItemGroupPage" },
      { icon: PostAddOutlinedIcon, text: "Stock Transactions", link: "/StockItemPage" },
      { icon: PostAddOutlinedIcon, text: "Item Status", link: "/ItemStockRecordPage" },
      { icon: ChecklistOutlinedIcon, text: "Stock In Categories", link: "/StockInCategoryPage" },
      { icon: ChecklistOutlinedIcon, text: "Stock Out Categories", link: "/StockOutCategoryPage" },
    ],
  },
  {
    key: "storage",
    title: "Storage & Locations",
    icon: WarehouseOutlinedIcon,
    items: [
      { icon: WarehouseOutlinedIcon, text: "Warehouses", link: "/WarehousePage" },
      { icon: AddBusinessOutlinedIcon, text: "Stores", link: "/StorePage" },
    ],
  },
  {
    key: "parties",
    title: "Parties & Stakeholders",
    icon: GroupsOutlinedIcon,
    items: [
      { icon: ThreePOutlinedIcon, text: "Parties", link: "/PartyPage" },
      { icon: PublishedWithChangesOutlinedIcon, text: "Resellers", link: "/ResellerPage" },
      { icon: BusinessIcon, text: "Agencies", link: "/AgencyPage" },
      { icon: SupportAgentIcon, text: "Support Persons", link: "/SupportPersonPage" },
      { icon: AssignmentIndIcon, text: "Assigned To", link: "/AssignedToPage" },
    ],
  },
  {
    key: "logistics",
    title: "Logistics & Delivery",
    icon: LocalShippingOutlinedIcon,
    items: [
      { icon: AllInboxOutlinedIcon, text: "Logistics Providers", link: "/LogisticsProviderCategoryPage" },
      { icon: LocalShippingTwoToneIcon, text: "Delivery Status", link: "/DeliveryStatusPage" },
      { icon: DownloadingOutlinedIcon, text: "Installation Status", link: "/InstallationStatusPage" },
    ],
  },
  {
    key: "ticketing",
    title: "Issue & Ticketing",
    icon: BugReportIcon,
    items: [
      { icon: BugReportIcon, text: "Issue Types", link: "/IssueTypePage" },
      { icon: AspectRatioIcon, text: "Resolution Status", link: "/ResolutionStatusPage" },
      { icon: ConfirmationNumberOutlinedIcon, text: "Ticket Status", link: "/TicketStatusPage" },
    ],
  },
  {
    key: "geography",
    title: "Geography",
    icon: MapOutlinedIcon,
    items: [
      { icon: LocationOnOutlinedIcon, text: "City", link: "/CityPage" },
      { icon: LocationCityOutlinedIcon, text: "State", link: "/StatePage" },
    ],
  },
  {
    key: "admin",
    title: "Administration",
    icon: GroupOutlinedIcon,
    items: [
      { icon: PersonOutlineOutlinedIcon, text: "Users", link: "/UserManagementPage", allowedRoles: ["admin"] },
      { icon: SettingsOutlinedIcon, text: "Settings", link: "/SettingsPage", allowedRoles: ["admin"] },
    ],
  },
];

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }: { open: boolean }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  [theme.breakpoints.down("sm")]: {
    display: open ? "block" : "none",
    width: open ? drawerWidth : 0,
    "& .MuiDrawer-paper": {
      width: open ? drawerWidth : 0,
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  },
  [theme.breakpoints.up("sm")]: {
    ...(open
      ? { ...openedMixin(theme), "& .MuiDrawer-paper": openedMixin(theme) }
      : { ...closedMixin(theme), "& .MuiDrawer-paper": closedMixin(theme) }),
  },
}));

interface NavigationDrawerProps {
  open: boolean;
  isDarkMode?: boolean;
  toggleColorMode?: () => void;
  handleDrawerOpen: () => void;
  handleDrawerClose: () => void;
}

export default function NavigationDrawer({
  open,
  isDarkMode,
  handleDrawerOpen,
  handleDrawerClose,
}: NavigationDrawerProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const bg = isDarkMode ? NAV_BG_DARK : NAV_BG;

  const canSee = React.useCallback(
    (item: Item) => !item.allowedRoles || (user ? item.allowedRoles.includes(user.role) : false),
    [user]
  );

  // Visible groups (after role-filtering their items).
  const groups = React.useMemo(
    () =>
      GROUPS.map((g) => ({ ...g, items: g.items.filter(canSee) })).filter((g) => g.items.length > 0),
    [canSee]
  );

  // Which group contains the current route — used to auto-open it.
  const activeGroupKey = React.useMemo(() => {
    const path = location.pathname.toLowerCase();
    return groups.find((g) => g.items.some((it) => path.startsWith(it.link.toLowerCase())))?.key ?? null;
  }, [groups, location.pathname]);

  const [expanded, setExpanded] = React.useState<string | null>(activeGroupKey);
  React.useEffect(() => {
    if (activeGroupKey) setExpanded(activeGroupKey);
  }, [activeGroupKey]);

  const toggleGroup = (key: string) => {
    if (!open) {
      // Collapsed rail: clicking a group icon opens the drawer and expands it.
      handleDrawerOpen();
      setExpanded(key);
      return;
    }
    setExpanded((cur) => (cur === key ? null : key));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authState");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/login");
    }
  };

  const itemActive = (link: string) =>
    location.pathname.toLowerCase().startsWith(link.toLowerCase());

  // ---- renderers (plain functions, NOT nested components — nested components
  //      would get a new identity each render and remount, killing the animation) ----

  const renderPrimary = (item: Item) => {
    const active = itemActive(item.link);
    const btn = (
      <NavLink to={item.link} style={{ textDecoration: "none" }}>
        <ListItemButton
          sx={{
            minHeight: 42,
            mx: 1,
            my: 0.25,
            borderRadius: "6px",
            px: 1.25,
            justifyContent: open ? "initial" : "center",
            color: "rgba(255,255,255,0.92)",
            backgroundColor: active ? "rgba(99,91,255,0.22)" : "transparent",
            boxShadow: active ? `inset 3px 0 0 0 ${ACCENT}` : "none",
            transition: "background-color .18s ease, box-shadow .18s ease, color .18s ease",
            "&:hover": { backgroundColor: active ? "rgba(99,91,255,0.28)" : "rgba(255,255,255,0.08)" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: open ? 1.5 : "auto", justifyContent: "center", color: active ? "#C7C3FF" : "rgba(255,255,255,0.75)", transition: "color .18s ease" }}>
            <item.icon fontSize="small" />
          </ListItemIcon>
          {open && (
            <ListItemText
              primary={item.text}
              sx={{ "& .MuiTypography-root": { fontSize: "0.85rem", fontWeight: active ? 700 : 500 } }}
            />
          )}
        </ListItemButton>
      </NavLink>
    );
    return (
      <ListItem key={item.link} disablePadding sx={{ display: "block" }}>
        {open ? btn : <Tooltip title={item.text} placement="right">{btn}</Tooltip>}
      </ListItem>
    );
  };

  const renderSubItem = (item: Item) => {
    const active = itemActive(item.link);
    return (
      <ListItem key={item.link} disablePadding sx={{ display: "block" }}>
        <NavLink to={item.link} style={{ textDecoration: "none" }}>
          <ListItemButton
            sx={{
              minHeight: 34,
              mx: 1,
              my: 0.1,
              pl: 3.5,
              pr: 1.25,
              borderRadius: "6px",
              color: "rgba(255,255,255,0.85)",
              backgroundColor: active ? "rgba(99,91,255,0.20)" : "transparent",
              boxShadow: active ? `inset 3px 0 0 0 ${ACCENT}` : "none",
              transition: "background-color .18s ease, box-shadow .18s ease",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.07)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: 1.25, justifyContent: "center", color: active ? "#C7C3FF" : "rgba(255,255,255,0.6)" }}>
              <item.icon sx={{ fontSize: "1rem" }} />
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{ "& .MuiTypography-root": { fontSize: "0.78rem", fontWeight: active ? 700 : 400 } }}
            />
          </ListItemButton>
        </NavLink>
      </ListItem>
    );
  };

  const renderGroup = (group: Group) => {
    const isOpen = expanded === group.key && open;
    const hasActive = group.items.some((it) => itemActive(it.link));
    const header = (
      <ListItemButton
        onClick={() => toggleGroup(group.key)}
        sx={{
          minHeight: 40,
          mx: 1,
          my: 0.25,
          borderRadius: "6px",
          px: 1.25,
          justifyContent: open ? "initial" : "center",
          color: "rgba(255,255,255,0.92)",
          backgroundColor: hasActive && !isOpen ? "rgba(255,255,255,0.06)" : "transparent",
          transition: "background-color .18s ease",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
        }}
      >
        <ListItemIcon sx={{ minWidth: 0, mr: open ? 1.5 : "auto", justifyContent: "center", color: hasActive ? "#C7C3FF" : "rgba(255,255,255,0.75)" }}>
          <group.icon fontSize="small" />
        </ListItemIcon>
        {open && (
          <>
            <ListItemText primary={group.title} sx={{ "& .MuiTypography-root": { fontSize: "0.82rem", fontWeight: 600 } }} />
            <ExpandMoreIcon
              fontSize="small"
              sx={{ color: "rgba(255,255,255,0.6)", transition: "transform .25s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </>
        )}
      </ListItemButton>
    );
    return (
      <Box key={group.key}>
        {open ? header : <Tooltip title={group.title} placement="right">{header}</Tooltip>}
        {/* framer height-auto animation — smooth open + close */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="submenu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <List disablePadding sx={{ py: 0.25 }}>
                {group.items.map((it) => renderSubItem(it))}
              </List>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        sx={{ backgroundColor: bg, color: "white", boxShadow: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 56, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={[{ mr: 2 }, open && { display: "none" }]}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              className="hidden md:flex font-display"
              sx={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              Omnify
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountCircle sx={{ color: "white", fontSize: "2rem", flexShrink: 0 }} />
            <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", alignItems: "flex-start", minWidth: 0, maxWidth: 200 }}>
              <Typography variant="body2" noWrap sx={{ color: "white", fontSize: "0.8rem", fontWeight: 600, maxWidth: 200 }}>
                {user?.name || user?.email}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                <Typography variant="caption" noWrap sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.68rem", maxWidth: 110 }}>
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.role}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.62rem",
                    color: "white",
                    backgroundColor:
                      user?.role === "admin" ? ACCENT : user?.role === "manager" ? "#0A66C2" : "rgba(255,255,255,0.2)",
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          "& .MuiDrawer-paper": {
            backgroundColor: bg,
            color: "white",
            boxSizing: "border-box",
            borderRight: "none",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Header: logo + collapse toggle */}
        <Toolbar
          variant="dense"
          sx={{ minHeight: 56, display: "flex", alignItems: "center", justifyContent: open ? "space-between" : "center", px: open ? 2 : 0 }}
        >
          {open && (
            <Typography component="div" className="font-display" sx={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
              Omnify
            </Typography>
          )}
          <IconButton onClick={open ? handleDrawerClose : handleDrawerOpen} sx={{ color: "white" }} size="small">
            {open ? <ChevronLeftIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </IconButton>
        </Toolbar>
        <Box sx={{ height: "1px", bgcolor: "rgba(255,255,255,0.1)", mx: open ? 2 : 1 }} />

        {/* Scrollable nav region */}
        <Box
          className="custom-scrollbar"
          sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 1, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
        >
          <List disablePadding>
            {PRIMARY.filter(canSee).map((it) => renderPrimary(it))}
          </List>

          {open && (
            <Typography variant="overline" sx={{ display: "block", color: "rgba(255,255,255,0.4)", px: 2.5, pt: 1.5, pb: 0.5 }}>
              Manage
            </Typography>
          )}
          {!open && <Box sx={{ height: "1px", bgcolor: "rgba(255,255,255,0.08)", mx: 1, my: 1 }} />}

          <List disablePadding>
            {groups.map((g) => renderGroup(g))}
          </List>
        </Box>

        {/* Pinned bottom: logout */}
        <Box sx={{ flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.1)", py: 0.75 }}>
          {(() => {
            const btn = (
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  minHeight: 44,
                  mx: 1,
                  borderRadius: "6px",
                  px: 1.25,
                  justifyContent: open ? "initial" : "center",
                  color: "#FFB4C0",
                  "&:hover": { backgroundColor: "rgba(223,27,65,0.18)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 1.5 : "auto", justifyContent: "center", color: "#FFB4C0" }}>
                  <Logout sx={{ fontSize: 18 }} />
                </ListItemIcon>
                {open && <ListItemText primary="Log Out" sx={{ "& .MuiTypography-root": { fontSize: "0.85rem", fontWeight: 600 } }} />}
              </ListItemButton>
            );
            return open ? btn : <Tooltip title="Log Out" placement="right">{btn}</Tooltip>;
          })()}
        </Box>
      </Drawer>
    </Box>
  );
}
