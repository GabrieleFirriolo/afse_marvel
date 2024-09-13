import React, { useEffect, useContext, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
  Divider,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UserContext from "../context/userContext";
import Notification from "../components/Notification";
import API from "../utils/api";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import { getShadowByRarity } from "../utils/functions";

const AlbumCard = ({
  title,
  artist,
  rarity,
  imageUrl,
  quantity,
  onSellClick,
  heroId,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/hero/${heroId}`);
  };
  return (
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
          boxShadow: getShadowByRarity(rarity),
          position: "relative",
          transition: "transform 0.6s ease-in-out",
          cursor: "pointer",
          overflow: "visible",
          backgroundImage: `url(${imageUrl})`,
          "&:hover": {
            transform: "scale(1.05)",
            "& .info-box.artist": {
              height: 80,
            },
          },
        }}
        onClick={handleCardClick}
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
            className="info-box"
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
                widows: "100%",
                height: "auto",
                color: "#ffffff",
                fontFamily: "serif",
                width: "100%",
                fontSize: Math.max(20, 30 - title.length / 3),
              }}
            >
              {title}
            </Typography>
            <Box
              className="info-box artist"
              sx={{
                height: 0,
                overflow: "hidden",
                transition: "height 0.6s ease-in-out",
              }}
            >
              <Box
                sx={{
                  mt: 2,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  transition: "height 0.6s ease-in-out",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    width: "50%",
                    px: 2,
                    py: 1,
                    backgroundColor: "#ef4444",
                    border: "4px solid #b91c1c",
                    textTransform: "uppercase",
                    color: "#ffffff",
                    fontWeight: "bold",
                    letterSpacing: "0.05em",
                    fontSize: "0.8rem",
                  }}
                >
                  {artist}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: 0, // Posizionamento sopra la carta
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
            {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
          </Typography>
        </Box>
      </Card>
      <Box
        sx={{
          width: 270,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          color: "#ffffff",
          mt: 2,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2">Quantity</Typography>
          <Typography variant="h6">x{quantity}</Typography>
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ backgroundColor: "#6b7280" }}
        />
        <Button
          variant="outlined"
          color="secondary"
          onClick={onSellClick}
          sx={{
            textTransform: "none",
            borderColor: "#ef4444",
            color: "#ffffff",
          }}
        >
          Sell
        </Button>
      </Box>
    </Box>
  );
};
const creditValues = {
  common: 0.2,
  uncommon: 0.5,
  rare: 1,
  epic: 2,
  legendary: 5,
};

const AlbumPage = () => {
  const { album, fetchAlbum, setAlbum, sellHero, user } =
    useContext(UserContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("");
  const [quantityOrder, setQuantityOrder] = useState("asc");
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const fetchData = useCallback(
    debounce(async (search, rarity, page) => {
      setLoading(true);
      try {
        const response = await fetchAlbum(page, search, rarity);
        console.log(response);
        setAlbum((prevAlbum) => [...prevAlbum, ...response.album]); // Append new data
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 600),

    []
  );
  useEffect(() => {
    fetchData(searchTerm, selectedRarity, page);
  }, [searchTerm, selectedRarity, page]);

  useEffect(() => {
    setLoading(true);
    setAlbum([]); // Clear the current album when filters change
    setPage(1); // Reset the page to 1
  }, [searchTerm, selectedRarity]);
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRarityChange = (e) => {
    setSelectedRarity(e.target.value);
  };

  const toggleQuantityOrder = () => {
    setQuantityOrder(quantityOrder === "asc" ? "desc" : "asc");
  };

  const handleSellClick = (album) => {
    setSelectedAlbum(album);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedAlbum(null);
  };

  const handleConfirmSell = async () => {
    try {
      await sellHero(selectedAlbum.hero._id);
      setNotification({
        open: true,
        message: "Hero sold successfully!",
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Error selling hero: ${
          error.response?.data?.error || error.message
        }`,
        severity: "error",
      });
    }
    setIsDialogOpen(false);
    setSelectedAlbum(null);
  };

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };
  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && page < totalPages) {
      setLoading(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Your Collection
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Rarity</InputLabel>
          <Select
            value={selectedRarity}
            onChange={handleRarityChange}
            label="Rarity"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="common">Common</MenuItem>
            <MenuItem value="uncommon">Uncommon</MenuItem>
            <MenuItem value="rare">Rare</MenuItem>
            <MenuItem value="epic">Epic</MenuItem>
            <MenuItem value="legendary">Legendary</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={toggleQuantityOrder}
          endIcon={
            quantityOrder === "asc" ? (
              <ArrowUpwardIcon />
            ) : (
              <ArrowDownwardIcon />
            )
          }
        >
          Quantity
        </Button>
      </Box>
      <Box
        sx={{
          maxHeight: { xs: "auto", md: "70vh" },
          overflowY: "auto",
          overflowX: "hidden",
          padding: 3,
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: 2,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555",
          },
        }}
        onScroll={handleScroll}
      >
        <Grid container spacing={3}>
          {album.map((album, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <AlbumCard
                heroId={album.hero._id}
                title={album.hero.name}
                artist="marvel"
                rarity={album.hero.rarity}
                imageUrl={album.hero.image}
                quantity={album.count}
                onSellClick={() => handleSellClick(album)}
              />
            </Grid>
          ))}
        </Grid>
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              mt: 3,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}
      </Box>

      {selectedAlbum && (
        <Dialog
          open={isDialogOpen}
          onClose={handleDialogClose}
          aria-labelledby="sell-dialog-title"
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle
            id="sell-dialog-title"
            sx={{ textAlign: "center", borderBottom: "1px solid #ccc" }}
          >
            Sell Card
          </DialogTitle>
          <DialogContent
            sx={{
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              mt: 2,
            }}
          >
            {/* Update the card to match the AlbumCard layout */}
            <Card
              sx={{
                width: "150px", // Updated width to match AlbumCard
                height: "200px", // Updated height to match AlbumCard
                border: "4px solid #292524", // Border styling from AlbumCard
                borderRadius: "8px",
                boxShadow: getShadowByRarity(selectedAlbum.hero.rarity), // Shadow based on rarity
                position: "relative",
                transition: "transform 0.6s ease-in-out", // Smooth hover transition
                cursor: "pointer",
                overflow: "visible",
                backgroundImage: `url(${selectedAlbum.hero.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                mt: 2,
              }}
            >
              {/* Front of the card */}
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",

                  background:
                    "linear-gradient(to top, #292524, rgba(41, 37, 36, 0.75), transparent)", // Gradient background for text visibility
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
                    variant="h6"
                    component="div"
                    sx={{
                      color: "#ffffff",
                      fontFamily: "serif",
                      fontSize: Math.max(
                        14,
                        20 - selectedAlbum.hero.name.length / 3
                      ), // Dynamic font size based on text length
                    }}
                  >
                    {selectedAlbum.hero.name}
                  </Typography>
                </Box>
              </Box>
              {/* Rarity tag */}
              <Box
                sx={{
                  position: "absolute",
                  top: 2,
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "#292524",
                  border: "2px solid #292524",
                  borderRadius: "8px",
                  px: 1,
                  py: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#ffffff",
                    textTransform: "capitalize",
                  }}
                >
                  {selectedAlbum.hero.rarity.charAt(0).toUpperCase() +
                    selectedAlbum.hero.rarity.slice(1)}
                </Typography>
              </Box>
            </Card>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                ml: 2,
                justifyContent: "center",
              }}
            >
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Are you sure you want to sell this card?
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Credits: {creditValues[selectedAlbum.hero.rarity]}
              </Typography>
              <DialogActions
                sx={{ display: "flex", justifyContent: "space-around" }}
              >
                <Button
                  onClick={handleDialogClose}
                  sx={{ color: "white", backgroundColor: "gray" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmSell}
                  sx={{ color: "white", backgroundColor: "primary.main" }}
                >
                  Sell
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>
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

export default AlbumPage;
