import React, { useState, useEffect } from "react";
import { Box, Grid, TextField, InputAdornment, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import API from "../utils/api";
import PackageCard from "../components/PackageCard";

const ShopPage = () => {
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await API.get("/packages/package-types");
        setPackages(response.data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };
    fetchPackages();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPackages = packages.filter((pack) =>
    pack.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Shop Packages
      </Typography>
      <TextField
        fullWidth
        placeholder="Search packages..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Grid container spacing={3}>
        {filteredPackages.map((pack) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={pack._id}>
            <PackageCard pack={pack} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ShopPage;
