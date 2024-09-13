// src/components/PurchaseCredits.js
import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Divider,
} from "@mui/material";
import creditsImg from "../assets/images/creditsImg.png";
import Notification from "../components/Notification";
import API from "../utils/api";
import UserContext from "../context/userContext";
const creditOptions = [
  { amount: 100, price: 10 },
  { amount: 500, price: 45 },
  { amount: 1000, price: 80 },
];

const PurchaseCredits = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const { user, buyCredits } = React.useContext(UserContext);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success", // Può essere 'success', 'error', 'warning', 'info'
  });
  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };
  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setCustomAmount("");
    setCustomPrice("");
  };

  const handleCustomAmountChange = (event) => {
    setSelectedOption(null);
    setCustomAmount(event.target.value);
    setCustomPrice(event.target.value * 0.09); // prezzo stimato per i crediti personalizzati
  };

  const handlePurchase = async () => {
    const amount = selectedOption ? selectedOption.amount : customAmount;
    const price = selectedOption ? selectedOption.price : customPrice;
    try {
      await buyCredits(amount);
      setNotification({
        open: true,
        message: "Credits purchased successfully!",
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Error purchasing credits: ${
          error.response?.data?.error || error.message
        }`,
        severity: "error",
      });
      console.error("Failed to purchase credits:", error);
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Purchase Credits
        </Typography>
        <Grid container spacing={4}>
          {creditOptions.map((option, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={selectedOption === option ? 8 : 2}
                sx={{
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor:
                    selectedOption === option
                      ? "primary.main"
                      : "background.paper",
                  color:
                    selectedOption === option
                      ? "primary.contrastText"
                      : "text.primary",
                }}
                onClick={() => handleSelectOption(option)}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width={"100%"}
                >
                  <img
                    src={creditsImg}
                    alt="coin"
                    style={{ width: "25px", marginRight: "5px" }}
                  />
                  <Typography variant="h5" fontWeight="bold">
                    {option.amount}
                  </Typography>
                </Box>
                <Typography variant="h6">${option.price}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box my={4}>
          <Divider>O</Divider>
        </Box>

        <Box my={4}>
          <Typography variant="h5">Custom Amount</Typography>
          <TextField
            label="Amount of credits"
            type="number"
            variant="outlined"
            value={customAmount}
            onChange={handleCustomAmountChange}
            sx={{ mr: 2 }}
          />
          <TextField
            label="Price ($)"
            type="number"
            variant="outlined"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            disabled
          />
        </Box>

        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePurchase}
            disabled={!selectedOption && (!customAmount || !customPrice)}
          >
            Buy Now
          </Button>
        </Box>
      </Box>
      {/* Notifica */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
    </Container>
  );
};

export default PurchaseCredits;
