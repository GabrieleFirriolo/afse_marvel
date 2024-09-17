import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  Button,
  TextField,
  Grid,
  IconButton,
  Divider,
} from "@mui/material";
import { Edit, Save, Cancel } from "@mui/icons-material";
import UserContext from "../context/userContext";
import HeroComboBox from "../components/HeroComboBox"; // Import the HeroComboBox component
import { getHeroById, getUserStats, updateUserProfile } from "../utils/api";
import Notification from "../components/Notification";
import { getShadowByRarity } from "../utils/functions";
const ProfilePage = () => {
  const { user, setUser } = useContext(UserContext);
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    username: user.username,
    email: user.email,
    favoriteHero: user.favoriteHero,
    password: "",
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { username, email, avatarUrl, favoriteHero, credits, role } = user;
  const id = localStorage.getItem("id");
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedHero = await getHeroById(favoriteHero);
        const stats = await getUserStats(id);
        setHero(fetchedHero);
        setUserStats(stats);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [favoriteHero, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile({ ...updatedProfile, [name]: value });
  };

  const handleHeroSelect = (selectedHero) => {
    setUpdatedProfile({ ...updatedProfile, favoriteHero: selectedHero?._id });
  };
  const handleUpdateProfile = async () => {
    try {

      const updatedUser = await updateUserProfile(id, updatedProfile);
      setUser(updatedUser.user);
      setIsEditing(false);
      setNotification({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Error updating profile: ${
          error.response?.data?.error || error.message
        }`,
        severity: "error",
      });
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
      <Card
        sx={{
          display: "flex",
          p: 3,
          mb: 3,
          boxShadow: 6,
          borderRadius: 2,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary}, ${theme.palette.secondary.light})`,
        }}
      >
        <Avatar
          src={hero && hero.image}
          alt={username}
          sx={{
            width: 120,
            height: 120,
            mr: 3,
            border: `4px solid ${(theme) => theme.palette.background.paper}`,
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
          {isEditing ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Username"
                  name="username"
                  value={updatedProfile.username}
                  onChange={handleInputChange}
                  fullWidth
                  variant="filled"
                  InputLabelProps={{
                    sx: { color: "white" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  value={updatedProfile.email}
                  onChange={handleInputChange}
                  fullWidth
                  variant="filled"
                  InputLabelProps={{
                    sx: { color: "white" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="New Password"
                  name="password"
                  type="password"
                  value={updatedProfile.password}
                  onChange={handleInputChange}
                  fullWidth
                  variant="filled"
                  InputLabelProps={{
                    sx: { color: "white" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <HeroComboBox
                  onHeroSelect={handleHeroSelect}
                  defaultHero={hero}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                <IconButton
                  onClick={handleUpdateProfile}
                  color="primary"
                  sx={{ mr: 2 }}
                >
                  <Save />
                </IconButton>
                <IconButton onClick={() => setIsEditing(false)} color="error">
                  <Cancel />
                </IconButton>
              </Grid>
            </Grid>
          ) : (
            <>
              <Typography variant="h4" sx={{ color: "white" }}>
                {username}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: "white" }}>
                {email}
              </Typography>
              <Typography variant="h6" sx={{ color: "white", mt: 1 }}>
                Credits: {credits.toFixed(2)}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: "white" }}>
                Role: {role}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: "white" }}>
                Active Trades: {userStats?.activeTrades || 0}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: "white" }}>
                Total Cards: {userStats?.totalCards || 0}
              </Typography>
              {/* {user._id === userStats?.user._id && ( */}
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ mt: 2 }}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              {/* )} */}
            </>
          )}
        </Box>
      </Card>
      {hero && (
        <Box
          sx={{
            display: "flex",
            p: 3,
            mb: 3,
            boxShadow: 6,
            borderRadius: 2,
            background: (theme) => theme.palette.background.paper,
          }}
        >
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={6} md={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: 470,
                }}
              >
                <Card
                  sx={{
                    width: 270,
                    height: 445,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "4px solid #292524",
                    borderRadius: "8px",
                    boxShadow: getShadowByRarity(hero.rarity, 4, 12),
                    position: "relative",
                    transition: "transform 0.6s ease-in-out",
                    cursor: "pointer",
                    overflow: "visible",
                    backgroundImage: `url(${hero.image})`,
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      background:
                        "linear-gradient(to top, #292524, rgba(41, 37, 36, 0.75), transparent)",
                    }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        textAlign: "center",
                        overflow: "hidden",
                      }}
                    >
                      <Typography
                        variant="h4"
                        component="div"
                        sx={{
                          color: "#ffffff",
                          fontFamily: "serif",
                          width: "100%",
                          fontSize: Math.max(20, 30 - hero.name.length / 3),
                        }}
                      >
                        {hero.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "#292524",
                      border: "4px solid #292524",
                      borderRadius: "8px",
                      px: 1.5,
                      py: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#ffffff",
                        textTransform: "capitalize",
                      }}
                    >
                      {hero.rarity.charAt(0).toUpperCase() +
                        hero.rarity.slice(1)}
                    </Typography>
                  </Box>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Favorite Hero Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hero.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ color: "text.primary" }}>
                Comics: {hero.comics}
              </Typography>
              <Typography variant="h6" sx={{ color: "text.primary" }}>
                Stories: {hero.stories}
              </Typography>
              <Typography variant="h6" sx={{ color: "text.primary" }}>
                Events: {hero.events}
              </Typography>
              <Typography variant="h6" sx={{ color: "text.primary" }}>
                Series: {hero.series}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
    </Box>
  );
};

export default ProfilePage;
