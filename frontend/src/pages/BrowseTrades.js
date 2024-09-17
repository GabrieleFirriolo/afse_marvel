// src/pages/TradePage.js
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  TextField,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import { styled } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import UserContext from "../context/userContext";
import API from "../utils/api";
import creditsImg from "../assets/images/creditsImg.png";
import Notification from "../components/Notification";
import DeleteIcon from "@mui/icons-material/Delete";
import TradeDialog from "../components/TradeDialog";
import { getStyleByRarity } from "../utils/functions";

const TradePlatformPage = () => {
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [tradeData, setTradeData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cardFilter, setCardFilter] = useState("");
  const [showUserTrades, setShowUserTrades] = useState(false);

  const { user } = useContext(UserContext);
  const id = localStorage.getItem("id");

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchTradeOffers = async () => {
    try {
      const response = await API.get("/trades/all");
      setTradeData(response.data.trades);
    } catch (error) {
      console.error("Error fetching trade offers:", error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const showMyTrades = urlParams.get("showMyTrades");
    if (showMyTrades === "true") {
      setShowUserTrades(true);
    }
    fetchTradeOffers();
  }, []);

  const handleOpenTradeDialog = (trade) => {
    setSelectedTrade(trade);
  };

  const handleCloseTradeDialog = () => {
    setSelectedTrade(null);
  };

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };
  const handleDeleteTrade = async (tradeId) => {
    try {
      const response = await API.post(`/trades/delete/${tradeId}`, {
        userId: id,
      });
      
      setNotification({
        open: true,
        message: "Trade deleted successfully!",
        severity: "success",
      });
      fetchTradeOffers(); // Refresh the list of trades
    } catch (error) {
      setNotification({
        open: true,
        message: `Error deleting the trade: ${
          error.response?.data?.error || error.message
        }`,
        severity: "error",
      });
      console.error("Error deleting trade:", error);
    }
  };

  // Filter trades based on whether showUserTrades is true
  const filteredTrades = tradeData.filter((trade) => {
    const usernameMatch = trade.proposer.username
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const cardMatch = cardFilter
      ? trade.proposedHeroes.some((card) =>
          card.name.toLowerCase().includes(cardFilter.toLowerCase())
        )
      : true;
    const userTradeMatch = showUserTrades
      ? trade.proposer._id === id
      : true;
    return usernameMatch && cardMatch && userTradeMatch;
  });
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Browse Trades
      </Typography>
      <Grid container spacing={2} justifyContent="space-between">
        <Grid item xs={12} md={6}>
          <TextField
            variant="outlined"
            label="Search by Username"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={Array.from(
              new Set(
                tradeData.flatMap((trade) =>
                  trade.proposedHeroes.map((card) => card.name)
                )
              )
            )}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            value={cardFilter}
            onChange={(event, newValue) => setCardFilter(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search by Card Name"
                placeholder="Filter cards..."
                variant="outlined"
              />
            )}
            sx={{ mb: 3 }}
          />
        </Grid>
      </Grid>
      <Button
        onClick={() => setShowUserTrades((prev) => !prev)}
        color="primary"
        variant="outlined"
        sx={{ mb: 2 }}
      >
        {showUserTrades ? "Show All Trades" : "Show My Trades"}
      </Button>
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
      >
        <Grid container spacing={3}>
          {filteredTrades.map((trade) => (
            <Grid item xs={12} md={6} lg={4} key={trade._id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      alt={trade.proposer.username}
                      src={trade.proposer.userAvatar}
                      sx={{ width: 48, height: 48, mr: 2 }}
                    />
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography variant="h6" fontWeight="bold">
                        {trade.proposer.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date:{" "}
                        {new Date(trade.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>
                  </Box>
                  <Grid
                    container
                    spacing={1}
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Grid
                      item
                      xs={6}
                      md={5.5}
                      sx={{
                        bgcolor: "background.paper",
                        p: 2,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        Offered Cards:
                      </Typography>
                      <Box
                        sx={{
                          height: "100%",
                          maxHeight: 100,
                          overflowY: "auto",
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
                      >
                        {trade.proposedHeroes.map((card, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontSize: 12,
                              ...getStyleByRarity(card.rarity),
                            }}
                          >
                            {card.name} - {card.rarity}
                          </Typography>
                        ))}
                      </Box>
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      md={5.5}
                      sx={{
                        bgcolor: "background.paper",
                        p: 2,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        Requested Cards:
                      </Typography>
                      <Box
                        sx={{
                          height: "100%",
                          maxHeight: 100,
                          overflowY: "auto",
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
                      >
                        {trade.requestedHeroes.map((card, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontSize: 12,
                              ...getStyleByRarity(card.rarity),
                            }}
                          >
                            {card.name} - {card.rarity}
                          </Typography>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="body2" fontWeight="bold">
                      Offered:{" "}
                      <img
                        src={creditsImg}
                        alt="coin"
                        style={{ width: "13px", marginRight: "5px" }}
                      />{" "}
                      {trade.proposedCredits}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      Requested:{" "}
                      <img
                        src={creditsImg}
                        alt="coin"
                        style={{ width: "13px", marginRight: "5px" }}
                      />{" "}
                      {trade.requestedCredits}
                    </Typography>
                  </Box>
                  <Box textAlign="center" mt={2}>
                    <Button
                      onClick={() => handleOpenTradeDialog(trade)}
                      color="primary"
                      variant="outlined"
                    >
                      View Details
                    </Button>
                    {trade.proposer._id === user._id && (
                      <Button
                        onClick={() => handleDeleteTrade(trade._id)}
                        color="secondary"
                        variant="contained"
                        startIcon={<DeleteIcon />}
                        sx={{ ml: 2 }}
                      >
                        Delete
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {selectedTrade && (
          <TradeDialog
            open={!!selectedTrade}
            onClose={() => setSelectedTrade(null)}
            trade={selectedTrade}
            fetchTradeOffers={fetchTradeOffers} 
            setNotification={setNotification} 
          />
        )}
      </Box>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
    </Box>
  );
};

export default TradePlatformPage;
