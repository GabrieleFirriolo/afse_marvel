import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import API from "../utils/api";

const CreatePackage = () => {
  const [packageName, setPackageName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(0);
  const [numHeroes, setNumHeroes] = useState(10); // Impostato a 10 come valore iniziale
  const [guaranteedHeroes, setGuaranteedHeroes] = useState({
    rare: 0,
    epic: 0,
    legendary: 0,
  });

  const getMaxAllowed = (type) => {
    const totalGuaranteed =
      guaranteedHeroes.rare +
      guaranteedHeroes.epic +
      guaranteedHeroes.legendary;
    const remaining = numHeroes - totalGuaranteed + guaranteedHeroes[type];
    return Math.min(remaining, numHeroes);
  };

  const handleChangeGuaranteed = (type) => (e) => {
    const value = parseInt(e.target.value, 10);
    setGuaranteedHeroes({
      ...guaranteedHeroes,
      [type]: value,
    });
  };

  const handleCreatePackage = async () => {
    try {
      const response = await API.post("/packages/create-package-type", {
        name: packageName,
        description,
        price: cost,
        numberOfHeroes: numHeroes,
        guanteedRare: guaranteedHeroes.rare,
        guaranteedEpic: guaranteedHeroes.epic,
        guaranteedLegendary: guaranteedHeroes.legendary,
      });

      if (response.status === 201) {
        alert("Package created successfully!");
        // Reset form fields
        setPackageName("");
        setDescription("");
        setCost(0);
        setNumHeroes(10); // Resetta a 10 dopo la creazione
        setGuaranteedHeroes({ rare: 0, epic: 0, legendary: 0 });
      }
    } catch (error) {
      console.error("Error creating package:", error);
      alert("Failed to create package");
    }
  };
  const handleChangeNumber = (number) => (e) => {
    setNumHeroes(Number(e.target.value));
    setGuaranteedHeroes({ rare: 0, epic: 0, legendary: 0 });
  };

  return (
    <Box sx={{ p: 3 }} maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Create a New Package
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Package Name"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Cost"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Number of Heroes"
            type="number"
            value={numHeroes}
            onChange={handleChangeNumber(numHeroes)}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Guaranteed Rare Heroes</InputLabel>
            <Select
              value={guaranteedHeroes.rare}
              onChange={handleChangeGuaranteed("rare")}
            >
              {[...Array(getMaxAllowed("rare") + 1).keys()].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Guaranteed Epic Heroes</InputLabel>
            <Select
              value={guaranteedHeroes.epic}
              onChange={handleChangeGuaranteed("epic")}
            >
              {[...Array(getMaxAllowed("epic") + 1).keys()].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Guaranteed Legendary Heroes</InputLabel>
            <Select
              value={guaranteedHeroes.legendary}
              onChange={handleChangeGuaranteed("legendary")}
            >
              {[...Array(getMaxAllowed("legendary") + 1).keys()].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreatePackage}
          >
            Create Package
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreatePackage;
