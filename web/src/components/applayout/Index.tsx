import { Outlet } from "react-router-dom";
import NavigationDrawer from "../common/NavigationDrawer";
import React from "react";
import { LayoutContext } from "./AppLayoutContext";
// import { LoadingSpinner } from "../../pages/LodingPage";
import { Box, useMediaQuery } from "@mui/material";
import { NestedEntityDialogContainer } from "../common/NestedEntityDialog";
import { useColorMode } from "../../theme/ColorModeProvider";

export const AppLayout = () => {
  // Auto-compact the sidebar on small screens.
  const isMobile = useMediaQuery("(max-width:900px)");
  const [open, setOpen] = React.useState<boolean>(!isMobile);
  const { mode, toggleColorMode } = useColorMode();
  const isDarkMode = mode === "dark";

  // Collapse when entering mobile width, expand when returning to desktop.
  React.useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  //  if (navigation.state === "loading") return <LoadingSpinner />;
  // if (navigation.state === "") return <ErrorPages />;
//   {user?.role === 'admin' && (
//   <Link
//     to="/register"
//     className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
//   >
//     User Management
//   </Link>
// )}
  return (
    <LayoutContext.Provider
      value={{
        open,
        isDarkMode,
        handleDrawerOpen,
        handleDrawerClose,
        toggleColorMode,
      }}
    >
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", bgcolor: "background.default" }}>
        <NavigationDrawer
          open={open}
          handleDrawerOpen={handleDrawerOpen}
          handleDrawerClose={handleDrawerClose}
          isDarkMode={isDarkMode}
          toggleColorMode={toggleColorMode}
        />
        <Box
          component="main"
          className="custom-scrollbar"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            height: "100vh",
            overflowY: "auto",
            // clear the fixed AppBar (dense toolbar = 56px)
            pt: "56px",
            bgcolor: "background.default",
          }}
        >
          <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, maxWidth: 1400, mx: "auto" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
      <NestedEntityDialogContainer />
    </LayoutContext.Provider>
  );
};
