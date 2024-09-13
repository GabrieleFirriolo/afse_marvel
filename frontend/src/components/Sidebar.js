import React from "react";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Home,
  ShoppingCart,
  SwapHoriz,
  Person,
  Notifications,
  Star,
} from "@mui/icons-material";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Link } from "react-router-dom";

const Sidebar = ({ onClose }) => {
  const role = localStorage.getItem("role");
  return (
    <Box
      sx={{
        width: { xs: "75vw", lg: "280px" },
        display: { xs: "block", lg: "block" },
        height: { xs: "100vh", lg: "auto" },
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Star fontSize="large" />
          <Typography variant="h6" component="a" fontWeight="bold">
            AFSE
          </Typography>
        </Box>
        <IconButton sx={{ ml: "auto" }} onClick={onClose}>
          <Notifications />
          <span className="sr-only">Toggle notifications</span>
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
        <List>
          <ListItem button component={Link} to="/" onClick={onClose}>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button component={Link} to="/album" onClick={onClose}>
            <ListItemIcon>
              <CollectionsBookmarkIcon />
            </ListItemIcon>
            <ListItemText primary="Album" />
          </ListItem>
          <ListItem button component={Link} to="/packages" onClick={onClose}>
            <ListItemIcon>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText primary="Packages" />
          </ListItem>

          <ListItem button component={Link} to="/shop" onClick={onClose}>
            <ListItemIcon>
              <ShoppingCart />
            </ListItemIcon>
            <ListItemText primary="Shop" />
          </ListItem>
          <ListItem button component={Link} to="/trade" onClick={onClose}>
            <ListItemIcon>
              <SwapHoriz />
            </ListItemIcon>
            <ListItemText primary="Trade" />
          </ListItem>
          <ListItem button component={Link} to="/profile" onClick={onClose}>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>

          {role === "admin" && (
            <React.Fragment>
              <Divider />
              <ListItem
                button
                component={Link}
                to="/admin/create-package"
                onClick={onClose}
              >
                <ListItemIcon>
                  <InventoryIcon />
                </ListItemIcon>
                <ListItemText primary="Create Package" />
              </ListItem>
              <ListItem
                button
                component={Link}
                to="/admin/manage-packages"
                onClick={onClose}
              >
                <ListItemIcon>
                  <InventoryIcon />
                </ListItemIcon>
                <ListItemText primary="Manage Packages" />
              </ListItem>
            </React.Fragment>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
