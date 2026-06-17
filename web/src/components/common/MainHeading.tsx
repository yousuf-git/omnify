import { Box, InputAdornment, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export const MainHeading = ({
  textOne,
  textTow,
}: {
  textOne: string;
  textTow: string;
}) => {
  return (
    <Box
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      sx={{ mb: 3 }}
    >
      {/* Title block — ink accent bar + tight enterprise heading */}
      <Box sx={{ display: "flex", alignItems: "stretch", gap: 1.5, minWidth: 0 }}>
        <Box
          sx={{
            width: "3px",
            borderRadius: "2px",
            bgcolor: "primary.main",
            flexShrink: 0,
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ lineHeight: 1.15, color: "text.primary" }}
            noWrap
          >
            {textOne}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mt: 0.25 }}
          >
            {textTow}
          </Typography>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ width: { xs: "100%", md: 300 }, flexShrink: 0 }}>
        <TextField
          id="search"
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
          placeholder="Search…"
          variant="outlined"
        />
      </Box>
    </Box>
  );
};
