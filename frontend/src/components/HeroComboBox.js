import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Avatar,
} from "@mui/material";
import { debounce } from "lodash";
import { getHeroes } from "../utils/api";

const HeroComboBox = ({ onHeroSelect, defaultHero }) => {
  const [heroes, setHeroes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchHeroes = async (query) => {
    setLoading(true);
    try {
      const response = await getHeroes(query);
      setHeroes(response);
    } catch (error) {
      console.error("Error fetching heroes:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchHeroes, 300), []);

  useEffect(() => {
    if (searchTerm) {
      debouncedFetch(searchTerm);
    } else {
      debouncedFetch("");
    }
  }, [searchTerm]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Avatar
        src={defaultHero?.image || ""}
        alt={defaultHero?.name || ""}
        sx={{ width: 56, height: 56, marginRight: 2 }}
      />
      <Autocomplete
        sx={{ width: "100%" }}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onInputChange={(event, newInputValue) => setSearchTerm(newInputValue)}
        options={heroes}
        loading={loading}
        onChange={(event, newValue) => {
          onHeroSelect(newValue);
        }}
        isOptionEqualToValue={(option, value) => option._id === value._id}
        getOptionLabel={(option) => option.name}
        defaultValue={defaultHero}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Avatar
              src={option.image}
              alt={option.name}
              sx={{ width: 24, height: 24 }}
            />
            {option.name}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Hero"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </Box>
  );
};

export default HeroComboBox;
