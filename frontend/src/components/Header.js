import React, { useState, useContext, useEffect } from "react";
import { Search } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import {
  Toolbar,
  IconButton,
  TextField,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import UserContext from "../context/userContext";
import { keyframes } from "@mui/system";
import creditsImg from "../assets/images/creditsImg.png";
import MenuIcon from "@mui/icons-material/Menu";
import { getHeroById } from "../utils/api";
import { Link } from "react-router-dom";

const increaseAnimation = keyframes`
  0% { color: green; transform: scale(1); }
  50% { color: limegreen; transform: scale(1.2); }
  100% { color: green; transform: scale(1); }
`;

const decreaseAnimation = keyframes`
  0% { color: red; transform: scale(1); }
  50% { color: darkred; transform: scale(0.8); }
  100% { color: red; transform: scale(1); }
`;

const Header = ({ toggleDrawer, isMobile }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, loading } = useContext(UserContext);
  const [previousCredits, setPreviousCredits] = useState(user?.credits);
  const [animation, setAnimation] = useState("");
  const [heroImage, setHeroImage] = useState(null); // State for hero image

  // Handle opening the menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    window.location.replace("/login");
    logout();
    handleMenuClose();
    console.log("logged out");
  };

  useEffect(() => {
    if (user?.credits > previousCredits) {
      setAnimation("increase");
    } else if (user?.credits < previousCredits) {
      setAnimation("decrease");
    }
    setPreviousCredits(user?.credits);

    // Reset animation after it completes
    const timeout = setTimeout(() => {
      setAnimation("");
    }, 1000);

    return () => clearTimeout(timeout);
  }, [user?.credits, previousCredits]);
  useEffect(() => {
    const fetchHeroImage = async () => {
      if (user?.favoriteHero) {
        try {
          const { image } = await getHeroById(user.favoriteHero);
          setHeroImage(image);
        } catch (error) {
          console.error("Failed to fetch hero image:", error);
        }
      }
    };

    fetchHeroImage();
  }, [user?.favoriteHero]);
  if (loading) {
    return <CircularProgress />;
  }
  return (
    <Toolbar
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 1rem",
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer}
          sx={{ mr: 2, display: { lg: "none" } }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 1rem",
          width: { xs: "100px", sm: "130px" }, // Usa larghezze fisse per diverse risoluzioni
        }}
      >
        <svg
          width="100%"
          height="auto"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          viewBox="0 0 130 52"
        >
          <rect fill="#EC1D24" width="100%" height="100%"></rect>
          <path
            fill="#FEFEFE"
            d="M126.222 40.059v7.906H111.58V4h7.885v36.059h6.757zm-62.564-14.5c-.61.294-1.248.44-1.87.442v-14.14h.04c.622-.005 5.264.184 5.264 6.993 0 3.559-1.58 5.804-3.434 6.705zM40.55 34.24l2.183-18.799 2.265 18.799H40.55zm69.655-22.215V4.007H87.879l-3.675 26.779-3.63-26.78h-8.052l.901 7.15c-.928-1.832-4.224-7.15-11.48-7.15-.047-.002-8.06 0-8.06 0l-.031 39.032-5.868-39.031-10.545-.005-6.072 40.44.002-40.435H21.278L17.64 26.724 14.096 4.006H4v43.966h7.95V26.78l3.618 21.192h4.226l3.565-21.192v21.192h15.327l.928-6.762h6.17l.927 6.762 15.047.008h.01v-.008h.02V33.702l1.845-.27 3.817 14.55h7.784l-.002-.01h.022l-5.011-17.048c2.538-1.88 5.406-6.644 4.643-11.203v-.002C74.894 19.777 79.615 48 79.615 48l9.256-.027 6.327-39.85v39.85h15.007v-7.908h-7.124v-10.08h7.124v-8.03h-7.124v-9.931h7.124z"
          ></path>
          <path fill="#EC1D24" d="M0 0h30v52H0z"></path>
          <path
            fill="#FEFEFE"
            d="M31.5 48V4H21.291l-3.64 22.735L14.102 4H4v44h8V26.792L15.577 48h4.229l3.568-21.208V48z"
          ></path>
        </svg>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            mr: 1,
            animation:
              animation === "increase"
                ? `${increaseAnimation} 1s`
                : animation === "decrease"
                ? `${decreaseAnimation} 1s`
                : "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <img src={creditsImg} alt="coin" style={{ width: "13px" }} />
            <Typography variant="subtitle1">
              {user?.credits?.toFixed(2)}
            </Typography>
          </Box>
        </Typography>
        <IconButton onClick={handleMenuOpen}>
          <Avatar src={heroImage} alt="User Avatar" />
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", ml: 1 }}>
            {user?.username}
          </Typography>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem disabled>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                borderBottom: "1px solid",
                borderColor: "white",
                color: "white",
              }}
            >
              My Account
            </Typography>
          </MenuItem>
          <MenuItem component={Link} to="/profile">Settings</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </Toolbar>
  );
};

export default Header;
