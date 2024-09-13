import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
} from "@mui/material";
import API from "../utils/api";

const ManagePackages = () => {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    // Fetch all packages from the API
    const fetchPackages = async () => {
      try {
        const response = await API.get("/packages/all-package-types");
        console.log(response.data); 
        setPackages(response.data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };

    fetchPackages();
  }, []);

  const toggleAvailability = async (packageId) => {
    try {
      const response = await API.put(`/packages/toggle-package-type/${packageId}`);
      const updatedPackage = response.data.package;

      // Update the state to reflect the change
      setPackages((prevPackages) =>
        prevPackages.map((pkg) =>
          pkg._id === updatedPackage._id ? updatedPackage : pkg
        )
      );
    } catch (error) {
      console.error("Error toggling package availability:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Packages
      </Typography>
      <List>
        {packages.map((pkg) => (
          <ListItem key={pkg._id} sx={{ mb: 2, backgroundColor: "#232336", borderRadius: 1 }}>
            <ListItemText
              primary={pkg.name}
              secondary={`Price: ${pkg.price} - Available: ${pkg.isAvailable ? "Yes" : "No"}`}
            />
            <ListItemSecondaryAction>
              <Switch
                checked={pkg.isAvailable}
                onChange={() => toggleAvailability(pkg._id)}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ManagePackages;
