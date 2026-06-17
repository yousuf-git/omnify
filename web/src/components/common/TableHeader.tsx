import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import React from "react";
import { NavLink } from "react-router-dom";
import type { TableHeaderProps } from "./type";

export const TableHeader = ({
  filterDropDow,
  tableHeading,
  buttonData,
}: TableHeaderProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Box
      className={`flex flex-col md:flex-row  justify-between rounded-tr-sm rounded-tl-sm text-white py-3 px-4 bg-[#1E293B]`}
    >
      <Box>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontSize: 18, fontWeight: "bold" }}
        >
          {tableHeading}
        </Typography>
      </Box>
      <Box className="flex flex-row gap-2">
        {buttonData.map((item, index) => (
          <NavLink
            to={item.link || "/default-path"}
            key={index}
            className="text-decoration-none"
          >
            <Button
              variant={item.variant}
              color={item.color}
              startIcon={<item.icon sx={{ fontSize: 10 }} />}
              sx={{ fontSize: 12 }}
            >
              <span className="hidden md:block">{item.text}</span>
            </Button>
          </NavLink>
        ))}

        <div>
          <Button
            id="demo-customized-button"
            aria-controls={open ? "demo-customized-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            variant="outlined"
            color="inherit"
            disableElevation
            onClick={handleClick}
            endIcon={<FilterAltOutlinedIcon />}
          >
            <span className="hidden md:block">Filter</span>
          </Button>
          <Menu
            id="demo-customized-menu"
            slotProps={{
              list: {
                "aria-labelledby": "demo-customized-button",
              },
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            {filterDropDow.map((option) => (
              <MenuItem
                key={option}
                disableRipple
                selected={option === "Pyxis"}
                onClick={handleClose}
              >
                {option}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </Box>
    </Box>
  );
};
