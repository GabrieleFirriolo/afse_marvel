import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import API from "../utils/api";
import { debounce } from "lodash";
import { getShadowByRarity } from "../utils/functions";
const Hero = () => {
  const { heroId } = useParams();
  const [hero, setHero] = useState(null);
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("comics");
  const [searchTerm, setSearchTerm] = useState("");
  const [content, setContent] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch hero details
  useEffect(() => {
    const fetchHeroDetails = async () => {
      try {
        const response = await API.get(`/heroes/${heroId}`);
        setHero(response.data);
      } catch (error) {
        console.error("Error fetching hero details:", error);
      } finally {
        setLoadingHero(false);
      }
    };

    fetchHeroDetails();
  }, [heroId]);

  // Fetch content
  const fetchContent = useCallback(
    debounce(async (category, searchTerm, page) => {
      if (!hero || !hero.marvelId || loadingContent) return;
      setLoadingContent(true);
      try {
        console.log(hero);
        const response = await API.get(`/heroes/${category}/${hero.marvelId}`, {
          params: { search: searchTerm, page },
        });
        if (page === 1) {
          setContent(response.data.results);
        } else {
          setContent((prevContent) => [
            ...prevContent,
            ...response.data.results,
          ]);
        }
        console.log(response.data.results);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoadingContent(false);
      }
    }, 1000),
    [hero, selectedCategory]
  );

  // Trigger content fetch when selectedCategory, searchTerm, or hero changes
  useEffect(() => {
    if (hero && hero.marvelId) {
      setContent([]);
      setPage(1);
      fetchContent(selectedCategory, searchTerm, 1);
    }
  }, [selectedCategory, searchTerm, hero]); // remove fetchContent

  // Handle page change
  useEffect(() => {
    if (page > 1 && hero && hero.marvelId) {
      fetchContent(selectedCategory, searchTerm, page);
    }
  }, [page, selectedCategory, searchTerm, hero]); // remove fetchContent

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    setPage(1);
    setContent([]);
  };

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && page < totalPages) {
      if (loadingContent) return;
      setPage((prevPage) => prevPage + 1);
    }
  };

  if (loadingHero) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!hero) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Hero not found
        </Typography>
        <Button variant="contained" onClick={() => navigate("/album")}>
          Back to Album
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              height: "100%",
              display: "flex",
              boxShadow: getShadowByRarity(hero.rarity),
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src={hero.image}
                  alt={hero.name}
                  style={{
                    borderRadius: "8px",
                    width: "100%",
                    marginBottom: "1rem",
                  }}
                />
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {hero.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {hero.description || "No description available."}
                </Typography>
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Rarity:{" "}
                    {hero.rarity.charAt(0).toUpperCase() + hero.rarity.slice(1)}
                  </Typography>
                  <Typography variant="body2">
                    Comics: {hero.comics || 0}
                  </Typography>
                  <Typography variant="body2">
                    Stories: {hero.stories || 0}
                  </Typography>
                  <Typography variant="body2">
                    Events: {hero.events || 0}
                  </Typography>
                  <Typography variant="body2">
                    Series: {hero.series || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
              }}
            >
              <TextField
                variant="outlined"
                placeholder="Search by name"
                value={searchTerm}
                disabled={loadingContent}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
              <Tabs
                value={selectedCategory}
                onChange={handleCategoryChange}
                indicatorColor="primary"
                textColor="primary"
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons="auto"
              >
                <Tab label="Comics" disabled={loadingContent} value="comics" />
                <Tab
                  label="Stories"
                  disabled={loadingContent}
                  value="stories"
                />
                <Tab label="Events" disabled={loadingContent} value="events" />
                <Tab label="Series" disabled={loadingContent} value="series" />
              </Tabs>
            </Box>

            <Box
              sx={{
                maxHeight: "60vh",
                overflowY: "auto",
                padding: 2,
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
              <Grid container spacing={2}>
                {content.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        p: 2,
                        height: "100%",
                      }}
                    >
                      <img
                        src={
                          item.thumbnail?.path && item.thumbnail?.extension
                            ? item.thumbnail.path +
                              "." +
                              item.thumbnail.extension
                            : "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg"
                        }
                        alt={item.title || item.name}
                        style={{ borderRadius: "8px", width: "100%" }}
                      />
                      <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                        {item.title || item.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          overflowY: "auto",
                          maxHeight: "60px", // Altezza massima per il testo descrittivo
                          textAlign: "center",
                          scrollbarWidth: "thin", // Per il supporto nei browser Firefox
                          "&::-webkit-scrollbar": {
                            width: "6px",
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
                        {item.description || "No description available."}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {loadingContent && (
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
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate("/album")}>
          Back to Album
        </Button>
      </Box>
    </Box>
  );
};

export default Hero;
