import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  Grid,
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
  Button,
  Input,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../context/userContext";
import API from "../utils/api";
import debounce from "lodash.debounce";
import Notification from "../components/Notification"; // Importa il componente di notifica
import creditsImg from "../assets/images/creditsImg.png";
import { styled } from "@mui/system";
import TradeDialog from "../components/TradeDialog";
import { getShadowByRarity } from "../utils/functions";
const AlbumCard = styled(Card)(({ rarity, selected }) => ({
  width: "150px", // Maintaining the smaller width
  height: "200px", // Maintaining the smaller height
  border: "4px solid #292524", // Border styling from the larger card
  borderRadius: "8px",
  boxShadow: getShadowByRarity(rarity), // Shadow based on rarity
  position: "relative",
  transition: "transform 0.6s ease-in-out", // Smooth hover transition
  cursor: "pointer",
  overflow: "visible",
  margin: "8px",
  marginTop: "12px",
  border: selected ? "3px solid #FFD700" : "none",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const AlbumCardContent = ({ card, onSelect, selected }) => (
  <AlbumCard
    rarity={card.rarity}
    selected={selected}
    onClick={() => onSelect(card)}
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
            fontSize: Math.max(14, 20 - card.name.length / 3), // Dynamic font size based on text length
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
          fontSize: "13px",
          color: "#ffffff",
          textTransform: "capitalize",
        }}
      >
        {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
      </Typography>
    </Box>
  </AlbumCard>
);

const TradePage = () => {
  const { user } = useContext(UserContext);
  const [offerCards, setOfferCards] = useState([]);
  const [requestCards, setRequestCards] = useState([]);
  const [proposedTrade, setProposedTrade] = useState([]);
  const [requestedTrade, setRequestedTrade] = useState([]);
  const [offerCredits, setOfferCredits] = useState(0);
  const [requestCredits, setRequestCredits] = useState(0);
  const [tradeOffers, setTradeOffers] = useState([]);
  const [offerSearchQuery, setOfferSearchQuery] = useState("");
  const [requestSearchQuery, setRequestSearchQuery] = useState("");
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);

  const navigate = useNavigate();

  const handleManageClick = () => {
    navigate("/trade/browse-all?showMyTrades=true");
  };
  // Stato per la notifica
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success", // Può essere 'success', 'error', 'warning', 'info'
  });

  const id = localStorage.getItem("id");

  const fetchOfferCards = async (search = "") => {
    try {
      const response = await API.get(`/trades/trade-cards/${id}`, {
        params: { search, limit: 10, type: "offer" }, // Tipo di ricerca per le carte offerte
      });
      setOfferCards(response.data.cards);
    } catch (error) {
      console.error("Error fetching offer cards:", error);
    }
  };

  const fetchRequestCards = async (search = "") => {
    try {
      const response = await API.get(`/trades/trade-cards/${id}`, {
        params: { search, limit: 10, type: "request" }, // Tipo di ricerca per le carte richieste
      });
      setRequestCards(response.data.cards);
    } catch (error) {
      console.error("Error fetching request cards:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOfferCards(offerSearchQuery);
    }
  }, [user, offerSearchQuery]);

  useEffect(() => {
    if (user) {
      fetchRequestCards(requestSearchQuery);
    }
  }, [user, requestSearchQuery]);

  const fetchTradeOffers = async () => {
    try {
      const response = await API.get(`/trades/latest`);
      setTradeOffers(response.data.trades);
    } catch (error) {
      console.error("Error fetching trade offers:", error);
    }
  };

  useEffect(() => {
    fetchTradeOffers();
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    let scrollInterval;

    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        scrollContainer.scrollLeft += 1;
        if (
          scrollContainer.scrollLeft >=
          scrollContainer.scrollWidth - scrollContainer.clientWidth
        ) {
          scrollContainer.scrollLeft = 0;
        }
      }, 16);
    };

    if (!isPaused) {
      startScrolling();
    }

    return () => {
      clearInterval(scrollInterval);
    };
  }, [isPaused]);

  const debouncedOfferSearch = useCallback(
    debounce((query) => {
      setOfferSearchQuery(query);
    }, 300),
    []
  );

  const debouncedRequestSearch = useCallback(
    debounce((query) => {
      setRequestSearchQuery(query);
    }, 300),
    []
  );

  const handleOfferSearchChange = (e) => {
    debouncedOfferSearch(e.target.value);
  };

  const handleRequestSearchChange = (e) => {
    debouncedRequestSearch(e.target.value);
  };

  const handleOfferSelect = (card) => {
    setProposedTrade((prev) => {
      const exists = prev.find((tradeCard) => tradeCard._id === card._id);
      if (exists) {
        return prev.filter((tradeCard) => tradeCard._id !== card._id);
      } else {
        return [...prev, card];
      }
    });
  };

  const handleRequestSelect = (card) => {
    setRequestedTrade((prev) => {
      const exists = prev.find((tradeCard) => tradeCard._id === card._id);
      if (exists) {
        return prev.filter((tradeCard) => tradeCard._id !== card._id);
      } else {
        return [...prev, card];
      }
    });
  };

  const handleProposedTradeSelect = (card) => {
    setProposedTrade((prev) =>
      prev.filter((tradeCard) => tradeCard._id !== card._id)
    );
  };

  const handleRequestedTradeSelect = (card) => {
    setRequestedTrade((prev) =>
      prev.filter((tradeCard) => tradeCard._id !== card._id)
    );
  };

  const handleSubmitTrade = async () => {
    try {
      const response = await API.post("/trades/propose", {
        proposer: id,
        proposedHeroes: proposedTrade.map((card) => card._id),
        requestedHeroes: requestedTrade.map((card) => card._id),
        proposedCredits: Number(offerCredits),
        requestedCredits: Number(requestCredits),
      });
      if (response.status === 201) {
        setNotification({
          open: true,
          message: "Trade proposed successfully",
          severity: "success",
        });
        // Reset state
        setProposedTrade([]);
        setRequestedTrade([]);
        setOfferCredits(0);
        setRequestCredits(0);
      }
    } catch (error) {
      console.error("Error proposing trade:", error);
      setNotification({
        open: true,
        message: `Error proposing trade: ${
          error.response?.data?.error || error.message
        }`,
        severity: "error",
      });
    }
  };

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleViewOfferClick = (offer) => {
    setSelectedTrade(offer);
  };
  return (
    <Box sx={{ p: 3, width: "100%" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Trade Your Cards
      </Typography>

      {/* Latest Trade Offers Section */}
      <Box
        sx={{
          width: {
            xs: "70vw", // Usa 100% della larghezza dello schermo su dispositivi mobili
            md: "130vh", // Mantieni la larghezza di 150vh su schermi di dimensioni medie e grandi
          },
          maxWidth: "100%",
          mx: "auto",
          bgcolor: "background.paper",
          p: 2,
          mb: 2,
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "relative",
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Latest Trade Offers
        </Typography>
        <Box
          ref={scrollContainerRef}
          sx={{
            display: "flex",
            overflow: "hidden",
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {tradeOffers.map((offer) => (
            <Card
              key={offer._id}
              sx={{
                minWidth: 250,
                mx: 1,
                flexShrink: 0,
              }}
            >
              <CardContent>
                <Typography variant="h6">{offer.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Created by: {offer.proposer.username}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Date:{" "}
                  {new Date(offer.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => handleViewOfferClick(offer)}
                >
                  View Offer
                </Button>
              </CardContent>
            </Card>
          ))}
          {/* Selected Trade Dialog */}
          {selectedTrade && (
            <TradeDialog
              open={Boolean(selectedTrade)}
              onClose={() => setSelectedTrade(null)}
              trade={selectedTrade}
              fetchTradeOffers={null}
              setNotification={setNotification}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              boxShadow: 3,
            }}
            onClick={handleManageClick}
          >
            Manage
          </Button>

          <Link to="/trade/browse-all" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                textTransform: "none",
                boxShadow: 3,
              }}
            >
              Browse all
            </Button>
          </Link>
        </Box>
      </Box>
      <Grid container spacing={2}>
        {/* Offer Cards Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Offer Cards
              </Typography>
              <TextField
                fullWidth
                placeholder="Search cards to offer..."
                sx={{ mb: 2 }}
                onChange={handleOfferSearchChange}
              />
              <Box
                sx={{
                  maxHeight: 300,
                  overflowY: "auto",
                  display: "flex",
                  flexWrap: "wrap",
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
                {offerCards.map((card, index) => (
                  <AlbumCardContent
                    key={index}
                    card={card}
                    onSelect={handleOfferSelect}
                    selected={
                      !!proposedTrade.find(
                        (tradeCard) => tradeCard._id === card._id
                      )
                    }
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Request Cards Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Request Cards
              </Typography>
              <TextField
                fullWidth
                placeholder="Search cards to request..."
                sx={{ mb: 2 }}
                onChange={handleRequestSearchChange}
              />
              <Box
                sx={{
                  maxHeight: 300,
                  overflowY: "auto",
                  display: "flex",
                  flexWrap: "wrap",
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
                {requestCards.map((card, index) => (
                  <AlbumCardContent
                    key={index}
                    card={card}
                    onSelect={handleRequestSelect}
                    selected={
                      !!requestedTrade.find(
                        (tradeCard) => tradeCard._id === card._id
                      )
                    }
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Proposed Trade Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Proposed Trade
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                {proposedTrade.map((card, index) => (
                  <AlbumCardContent
                    key={index}
                    card={{ ...card, quantity: undefined }}
                    onSelect={handleProposedTradeSelect}
                    selected={false}
                  />
                ))}
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Requested Trade
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                {requestedTrade.map((card, index) => (
                  <AlbumCardContent
                    key={index}
                    card={card}
                    onSelect={handleRequestedTradeSelect}
                    selected={false}
                  />
                ))}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Credits
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" sx={{ mr: 2 }}>
                    <Typography>Offer:</Typography>
                    <Box
                      component="img"
                      src={creditsImg}
                      alt="credits"
                      sx={{ width: 20, ml: 4 }}
                    />
                  </Box>
                  <Input
                    type="number"
                    value={offerCredits}
                    onChange={(e) => setOfferCredits(e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={{ width: 100 }}
                  />
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" sx={{ mr: 2 }}>
                    <Typography>Request:</Typography>
                    <Box
                      component="img"
                      src={creditsImg}
                      alt="credits"
                      sx={{ width: 20, ml: 1 }}
                    />
                  </Box>
                  <Input
                    type="number"
                    value={requestCredits}
                    onChange={(e) => setRequestCredits(e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={{ width: 100 }}
                  />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitTrade}
                >
                  Submit Trade
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifica */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
    </Box>
  );
};

export default TradePage;
