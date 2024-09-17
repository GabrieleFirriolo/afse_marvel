// src/pages/TradePage.js
import React, { useContext } from "react";
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
} from "@mui/material";
import API from "../utils/api";
import { styled } from "@mui/system";
import UserContext from "../context/userContext";
import creditsImg from "../assets/images/creditsImg.png";
const getShadowByRarity = (rarity) => {
  switch (rarity) {
    case "common":
      return "0 8px 8px rgba(117, 117, 117, 0.5)";
    case "uncommon":
      return "0 8px 8px rgba(56, 142, 60, 0.5)";
    case "rare":
      return "0 8px 8px rgba(25, 118, 210, 0.5)";
    case "epic":
      return "0 8px 8px rgba(142, 36, 170, 0.5)";
    case "legendary":
      return "0 8px 8px rgba(245, 124, 0, 0.5)";
    default:
      return "0 8px 8px rgba(117, 117, 117, 0.5)";
  }
};
const CardBox = styled(Card)(({ rarity }) => ({
  width: "100px", 
  height: "150px", 
  border: "4px solid #292524",
  borderRadius: "8px",
  boxShadow: getShadowByRarity(rarity),
  position: "relative",
  transition: "transform 0.6s ease-in-out",
  cursor: "pointer",
  overflow: "visible",
  margin: "8px",
  marginTop: "12px",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const SectionBox = styled(Box)(({ bg }) => ({
  backgroundColor: bg,
  padding: "20px",
  borderRadius: "8px",
  marginTop: "20px",
  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
  border: "1px solid #ccc",
}));

const TradeDialog = ({
  open,
  onClose,
  trade,
  fetchTradeOffers,
  setNotification,
}) => {
  const { user,setUser } = useContext(UserContext);
  const id = localStorage.getItem("id");
  const handleCloseTradeDialog = () => {
    onClose();
  };
  const handleAcceptTrade = async (tradeId) => {
    const id = localStorage.getItem("id");
    try {
      const response = await API.put(`/trades/accept/${tradeId}`, {
        acceptorId: id,
      });
      setNotification({
        open: true,
        message: "Trade accepted successfully!",
        severity: "success",
      });
      if (fetchTradeOffers) {
        fetchTradeOffers(); // Ricarca la lista dei trade
      }
      handleCloseTradeDialog();
    } catch (error) {
      setNotification({
        open: true,
        message: `Error accepting the trade: ${
          error.response?.data?.error || error.message
        }`,
        severity: "error",
      });
      console.error("Error accepting trade:", error);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={handleCloseTradeDialog}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ textAlign: "center", borderBottom: "1px solid #ccc" }}>
        Trade Details
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" textAlign="center" m={2}>
          {trade.name}
        </Typography>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12} md={5}>
            <SectionBox bg="background.paper">
              <Typography
                variant="h6"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
              >
                Offered Cards
              </Typography>
              <Box display="flex" flexWrap="wrap" justifyContent="center">
                {trade.proposedHeroes.map((card, index) => (
                  <CardBox
                    key={index}
                    rarity={card.rarity}
                    selected={false}
                    sx={{
                      backgroundImage: `url(${card.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
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
                            fontSize: Math.max(12, 18 - card.name.length / 3), 
                          }}
                        >
                          {card.name}
                        </Typography>
                      </Box>
                    </Box>
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
                          fontSize: "10px",
                          color: "#ffffff",
                          textTransform: "capitalize",
                        }}
                      >
                        {card.rarity.charAt(0).toUpperCase() +
                          card.rarity.slice(1)}
                      </Typography>
                    </Box>
                  </CardBox>
                ))}
              </Box>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ mt: 1, textAlign: "center" }}
              >
                Offered:
                <img
                  src={creditsImg}
                  alt="coin"
                  style={{
                    width: "13px",
                    marginRight: "5px",
                    marginLeft: "5px",
                  }}
                />{" "}
                {trade.proposedCredits}
              </Typography>
            </SectionBox>
          </Grid>
          <Grid item xs={12} md={2} textAlign="center">
            <Avatar
              alt={trade.proposer.username}
              src={trade.proposer.userAvatar}
              sx={{ width: 100, height: 100, mb: 2, mx: "auto" }}
            />
            <Typography variant="body1" fontWeight="bold">
              {trade.proposer.username}
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <SectionBox bg="background.paper">
              <Typography
                variant="h6"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
              >
                Requested Cards
              </Typography>
              <Box display="flex" flexWrap="wrap" justifyContent="center">
                {trade.requestedHeroes.map((card, index) => (
                  <CardBox
                    key={index}
                    rarity={card.rarity}
                    selected={false} 
                    sx={{
                      backgroundImage: `url(${card.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
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
                            fontSize: Math.max(12, 18 - card.name.length / 3), 
                          }}
                        >
                          {card.name}
                        </Typography>
                      </Box>
                    </Box>
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
                          fontSize: "10px",
                          color: "#ffffff",
                          textTransform: "capitalize",
                        }}
                      >
                        {card.rarity.charAt(0).toUpperCase() +
                          card.rarity.slice(1)}
                      </Typography>
                    </Box>
                  </CardBox>
                ))}
              </Box>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ mt: 1, textAlign: "center" }}
              >
                Requested:{" "}
                <img
                  src={creditsImg}
                  alt="coin"
                  style={{
                    width: "13px",
                    marginRight: "5px",
                    marginLeft: "5px",
                  }}
                />{" "}
                {trade.requestedCredits}
              </Typography>
            </SectionBox>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {trade.proposer._id !== id && (
          <Button
            onClick={() => handleAcceptTrade(trade._id)}
            color="primary"
            variant="contained"
          >
            Accept
          </Button>
        )}
        <Button
          onClick={handleCloseTradeDialog}
          color="primary"
          variant="outlined"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TradeDialog;
