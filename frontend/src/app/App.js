import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  useMediaQuery,
  Drawer,
  GlobalStyles,
} from "@mui/material";
import { deepPurple, red } from "@mui/material/colors";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import HomePage from "../pages/HomePage";
import TradePage from "../pages/Trade";
import AlbumPage from "../pages/Album";
import PackagesPage from "../pages/Packages";
import ShopPage from "../pages/Shop";
import ProfilePage from "../pages/Profile";
import BrowseTrades from "../pages/BrowseTrades";
import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Register";
import { Box } from "@mui/material";
import { UserProvider } from "../context/userContext";
import Purchase from "../pages/PurchaseCredits";
import Hero from "../pages/Hero";
import CreatePackage from "../pages/CreatePackage";
import ManagePackages from "../pages/ManagePackages";
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: red[700],
      contrastText: "#fff",
    },
    background: {
      default: "#1e1e2f",
      paper: "#232336",
    },
    text: {
      primary: "#e1e1e1",
      secondary: "#b0b0b0",
    },
    action: {
      active: "#fff",
      hover: "rgba(255, 255, 255, 0.08)",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: red[700],
          color: "#fff",
          "&:hover": {
            backgroundColor: red[900],
          },
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles // Apply global styles for scrollbar customization
        styles={{
          "*::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "*::-webkit-scrollbar-track": {
            backgroundColor: "#1e1e2f",
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "4px",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555",
          },
          "*": {
            scrollbarWidth: "thin",
            scrollbarColor: "#888 #1e1e2f",
          },
        }}
      />
      <UserProvider>
        <Router>
          <Box
            sx={{ display: "flex", minHeight: "100vh", overflowY: "hidden" }}
          >
            {isAuthenticated && (
              <>
                {!isMobile && <Sidebar />}
                <Drawer
                  anchor="left"
                  open={isDrawerOpen}
                  onClose={toggleDrawer}
                  sx={{ display: { xs: "block", lg: "none", height: "100vh" } }}
                >
                  <Sidebar onClose={toggleDrawer} />
                </Drawer>
              </>
            )}
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              {isAuthenticated && (
                <Header toggleDrawer={toggleDrawer} isMobile={isMobile} />
              )}

              <Box sx={{ flex: 1, p: 3 }}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      isAuthenticated ? <HomePage /> : <Navigate to="/login" />
                    }
                  />
                  <Route path="/hero/:heroId" element={<Hero />} />

                  <Route
                    path="/purchase-credits"
                    element={
                      isAuthenticated ? <Purchase /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/trade"
                    element={
                      isAuthenticated ? <TradePage /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/trade/browse-all"
                    element={
                      isAuthenticated ? (
                        <BrowseTrades />
                      ) : (
                        <Navigate to="/login" />
                      )
                    }
                  />
                  <Route
                    path="/trade/my-trades"
                    element={
                      isAuthenticated ? <TradePage /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/album"
                    element={
                      isAuthenticated ? <AlbumPage /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/packages"
                    element={
                      isAuthenticated ? (
                        <PackagesPage />
                      ) : (
                        <Navigate to="/login" />
                      )
                    }
                  />
                  <Route
                    path="/shop"
                    element={
                      isAuthenticated ? <ShopPage /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      isAuthenticated ? (
                        <ProfilePage />
                      ) : (
                        <Navigate to="/login" />
                      )
                    }
                  />
                  <Route
                    path="/admin/create-package"
                    element={
                      isAuthenticated &&
                      localStorage.getItem("role") === "admin" ? (
                        <CreatePackage />
                      ) : (
                        <Navigate to="/" />
                      )
                    }
                  />
                  <Route
                    path="/admin/manage-packages"
                    element={
                      isAuthenticated ? (
                        <ManagePackages />
                      ) : (
                        <Navigate to="/login" />
                      )
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      isAuthenticated ? (
                        <Navigate to="/" />
                      ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                      )
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      isAuthenticated ? (
                        <Navigate to="/" />
                      ) : (
                        <RegisterPage
                          onRegisterSuccess={handleRegisterSuccess}
                        />
                      )
                    }
                  />
                </Routes>
              </Box>
            </Box>
          </Box>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
