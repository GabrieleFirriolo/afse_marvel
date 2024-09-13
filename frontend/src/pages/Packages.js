// src/pages/PackagePage.js
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
} from "@mui/material";
import { styled, keyframes } from "@mui/system";
import marvel_back from "../assets/images/marvel_back.svg";
import UserContext from "../context/userContext";
import API from "../utils/api";
import { getShadowByRarity } from "../utils/functions";
const appearFromTopLeft = keyframes`
  0% {
    opacity: 0;
    transform: translate(-100%, -100%);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0);
  }
`;

const FlippableCard = styled(Box)(({ flipped, rarity, delay }) => ({
  perspective: "1000px",
  width: "100px",
  height: "150px",
  animation: `${appearFromTopLeft} 0.5s ${delay}s forwards`,
  opacity: 0,

  ".inner": {
    position: "relative",
    width: "100%",
    height: "100%",
    textAlign: "center",
    transformStyle: "preserve-3d",
    transition: "transform 0.6s",
    transform: flipped ? "rotateY(0)" : "rotateY(180deg)",
  },
  ".front, .back": {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    borderRadius: "8px",
  },
  ".front": {
    border: "4px solid #292524", // Border styling from AlbumCard
    borderRadius: "8px",
    boxShadow: getShadowByRarity(rarity), // Shadow based on rarity
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "transform 0.6s ease-in-out", // Smooth hover transition
    cursor: "pointer",
    overflow: "visible",
    // "&:hover": {
    //   transform: "scale(1.01)",
    // },
    background: `linear-gradient(to top, #292524, rgba(41, 37, 36, 0.75), transparent)`, // Gradient background for text visibility
  },
  ".back": {
    background: "#232336",
    transform: "rotateY(180deg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      boxShadow: getShadowByRarity(rarity, 8),
    },
  },
}));
const PackageCard = ({
  title,
  description,
  imageUrl,
  numHeroes,
  quantity,
  onOpenClick,
}) => {
  return (
    <Card
      sx={{
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
          backgroundImage: `url(${imageUrl})`,
        }}
      />
      <CardContent>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "start", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Heroes: {numHeroes}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quantity: {quantity}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          onClick={onOpenClick}
          sx={{ mt: 2 }}
        >
          Open
        </Button>
      </CardContent>
    </Card>
  );
};

const PackagePage = () => {
  const { user, openPackage, fetchPackages, packages } =
    useContext(UserContext);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openedCards, setOpenedCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);

  useEffect(() => {
    if (user) {
      fetchPackages();
    }
  }, [user]);
  const handleOpenPackageClick = (pack) => {
    setSelectedPackage(pack);
    setOpenedCards([]); // Reset opened cards
    setFlippedCards([]); // Reset flipped cards
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPackage(null);
  };

  const handleOpenClick = async () => {
    const openedCards = await openPackage(selectedPackage._id);
    setOpenedCards(openedCards);
    setFlippedCards(new Array(openedCards.length).fill(false));
    fetchPackages();
  };

  const handleCardClick = (index) => {
    const newFlippedCards = [...flippedCards];
    newFlippedCards[index] = !newFlippedCards[index];
    setFlippedCards(newFlippedCards);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Your Packages
      </Typography>
      <Grid container spacing={3}>
        {packages.map((pack, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <PackageCard
              title={pack.name}
              description={pack.description}
              imageUrl={marvel_back}
              numHeroes={pack.numberOfHeroes}
              quantity={pack.quantity}
              onOpenClick={() => handleOpenPackageClick(pack)}
            />
          </Grid>
        ))}
      </Grid>

      {selectedPackage && (
        <Dialog
          open={isDialogOpen}
          onClose={handleDialogClose}
          aria-labelledby="open-package-dialog-title"
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            id="open-package-dialog-title"
            sx={{ textAlign: "center", borderBottom: "1px solid #ccc" }}
          >
            Open Package
          </DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ textAlign: "center", flex: "0 0 200px" }}>
              <Card
                sx={{
                  position: "relative",
                  background: (theme) => theme.palette.background.paper,
                  color: (theme) => theme.palette.text.primary,
                  margin: "auto",
                  borderRadius: 2,
                  overflow: "hidden",
                  width: "150px",
                  height: "250px",
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
                  <Typography variant="h6" component="div">
                    {selectedPackage.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Heroes: {selectedPackage.numberOfHeroes}
                  </Typography>
                </CardContent>
              </Card>
              <Button
                disabled={openedCards.length !== 0}
                variant="outlined"
                color="primary"
                onClick={handleOpenClick}
                sx={{ mt: 2 }}
              >
                Open
              </Button>
            </Box>
            <Box
              sx={{
                width: "70%",
                height: "400px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #ccc",
                borderRadius: 2,
                padding: 2,
                mt: 2,
                overflowY: "auto",
              }}
            >
              {openedCards.length === 0 && (
                <Typography variant="h6" color="text.secondary">
                  Open the package to reveal the cards
                </Typography>
              )}
              <Grid container spacing={2} sx={{ justifyContent: "center" }}>
                {openedCards.map((card, index) => (
                  <Grid item key={index}>
                    <FlippableCard
                      flipped={flippedCards[index]}
                      rarity={card.rarity}
                      delay={index * 0.3} // Delay increment for each card
                      onClick={() => handleCardClick(index)}
                    >
                      <Box
                        className="inner"
                        sx={{
                          backgroundImage: `url(${card.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          borderRadius: "10px",
                        }}
                      >
                        <Box className="front">
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "flex-end",

                              background:
                                "linear-gradient(to top, #292524, rgba(41, 37, 36, 0), transparent)", // Gradient background for text visibility
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
                                    12,
                                    18 - card.name.length / 3
                                  ), // Dynamic font size based on text length
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
                              {card.rarity.charAt(0).toUpperCase() +
                                card.rarity.slice(1)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box className="back">
                          <img
                            src={marvel_back}
                            alt="Marvel Logo"
                            style={{ width: "50px", height: "50px" }}
                          />
                        </Box>
                      </Box>
                    </FlippableCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleDialogClose}
              sx={{ color: "white", backgroundColor: "gray" }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PackagePage;
