import React, { useContext, useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/userContext";
import API from "../utils/api";
import PackageCard from "../components/PackageCard";
import creditsImg from "../assets/images/creditsImg.png";

const HomePage = () => {
  const navigate = useNavigate();

  const { user, loading, totalCards, fetchAlbum } = useContext(UserContext);
  const [tradeRequestsCount, setTradeRequestsCount] = useState(0);
  const [featuredPacks, setFeaturedPacks] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAlbum();
        // Fetch featured packs
        const packsResponse = await API.get(`/packages/featured`);
        setFeaturedPacks(packsResponse.data);
        console.log(packsResponse);
        // Fetch trade requests count
        const id = localStorage.getItem("id");
        const tradesResponse = await API.get(`/users/trades/${id}`);
        setTradeRequestsCount(tradesResponse.data.trades.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLocalLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading || localLoading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", color: "text.primary" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome to AFSE
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 2,
              bgcolor: "background.paper",
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Your Album
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {totalCards} Cards
              </Typography>
              <Box
                sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}
              >
                {[...Array(5)].map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 40,
                      height: 60,
                      bgcolor: "grey.300",
                      borderRadius: 1,
                    }}
                  />
                ))}
              </Box>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
                onClick={() => navigate("/album")}
              >
                View Album
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 2,
              bgcolor: "background.paper",
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Your Credits
              </Typography>
              <Box display="flex" alignItems="center">
                <img
                  src={creditsImg}
                  alt="coin"
                  style={{ width: "13px", marginRight: "5px" }}
                />
                <Typography variant="h5" fontWeight="bold">
                  {user.credits.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    mr: 1,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                  onClick={() => navigate("/purchase-credits")}
                >
                  Buy Credits
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                  onClick={() => navigate("/album")}
                >
                  Sell Hero
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 2,
              bgcolor: "background.paper",
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Trade Requests
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {tradeRequestsCount} Pending Requests
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    mr: 1,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                  onClick={() =>
                    navigate("/trade/browse-all?showMyTrades=true")
                  }
                >
                  View Requests
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                  onClick={() => navigate("/trade")}
                >
                  New Trade
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
        Featured Packs
      </Typography>
      {featuredPacks.length > 0 ? (
        <Grid container spacing={3}>
          {featuredPacks.map((pack, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <PackageCard pack={pack} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card
          sx={{
            mt: 3,
            p: 4,
            bgcolor: "background.paper",
            textAlign: "center",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No featured packs available at the moment.
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Visit our shop to find more packs and start collecting!
          </Typography>
          <Button
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              textTransform: "none",
            }}
            onClick={() => navigate("/shop")}
          >
            GO TO SHOP
          </Button>
        </Card>
      )}
    </Box>
  );
};

export default HomePage;
