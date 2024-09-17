// src/components/PackageCard.js
import React, { useState, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import marvel_back from "../assets/images/marvel_back.svg";
import API from "../utils/api";
import UserContext from "../context/userContext";
import Notification from "./Notification";
import creditsImg from "../assets/images/creditsImg.png";

const PackageCard = ({ pack }) => {
  const { buyPackage } = useContext(UserContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const handleBuyClick = () => {
    setQuantity(1);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmBuy = async () => {
    try {
      const response = await buyPackage(pack._id, quantity);
      console.log(response);
      if (response.status === 201) {
        setNotification({
          open: true,
          message: `Package bought successfully : ${quantity} `,
          severity: "success",
        });
        handleDialogClose();
      }
    } catch (error) {
      setNotification({
        open: true,
        message: `Error buying the package: ${
          error.response?.data?.error || error.message
        }`,
        severity: "error",
      });
      console.error("Error buying package:", error);
    }
  };

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Card
        sx={{
          width: 300,
          height: 420,
          position: "relative",
          background: (theme) => theme.palette.background.paper,
          color: (theme) => theme.palette.text.primary,
          margin: 2,
          borderRadius: 2,
          overflow: "hidden",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: 200,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundImage: `url(${marvel_back})`,
            mb: 2,
          }}
        />
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            {pack.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {pack.description}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "start", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Heroes: {pack.numberOfHeroes}
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Cost:
              </Typography>
              <img
                src={creditsImg}
                alt="coin"
                style={{ width: "13px", marginRight: "5px", marginLeft: "5px" }}
              />
              <Typography variant="body2" color="text.secondary">
                {pack.price}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
            onClick={handleBuyClick}
          >
            Buy
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="buy-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          id="buy-dialog-title"
          sx={{ textAlign: "center", borderBottom: "1px solid #ccc" }}
        >
          Buy Package
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Card
            sx={{
              position: "relative",
              background: (theme) => theme.palette.background.paper,
              color: (theme) => theme.palette.text.primary,
              margin: "auto",
              borderRadius: 2,
              overflow: "hidden",
              width: "150px",
              height: "220px",
            }}
          >
            <Box
              sx={{
                position: "relative",
                height: 100,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundImage: `url(${marvel_back})`,
              }}
            />
            <CardContent>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: "#ffffff",
                  fontSize: Math.max(12, 18 - pack.name.length / 3), // Dynamic font size based on text length
                }}
              >
                {pack.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Heroes: {pack.numberOfHeroes}
              </Typography>
            </CardContent>
          </Card>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              ml: 2,
              justifyContent: "center",
              width: "60%",
            }}
          >
            <Typography variant="body1" sx={{ mb: 1 }}>
              Are you sure to buy this package?
            </Typography>
            <TextField
              type="number"
              label="Quantity"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value)))
              }
              sx={{ mb: 1 }}
            />
            <Typography variant="body2">
              Total Cost:{" "}
              <img
                src={creditsImg}
                alt="coin"
                style={{ width: "13px", marginRight: "5px", marginLeft: "5px" }}
              />
              {pack.price * quantity}
            </Typography>
            <DialogActions sx={{ mt: 2, justifyContent: "space-between" }}>
              <Button
                onClick={handleDialogClose}
                sx={{ color: "white", backgroundColor: "gray" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBuy}
                sx={{ color: "white", backgroundColor: "primary.main" }}
              >
                Buy
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Notifica */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
    </>
  );
};

export default PackageCard;
