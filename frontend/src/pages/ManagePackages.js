import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete"; // Icona per il pulsante di eliminazione
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

  const deletePackage = async (packageId) => {
    try {
      // Call the API to delete the package and open all packages before deletion
      const response = await API.delete(`/packages/delete-package-type/${packageId}`);
      console.log(response.data.message);

      // Remove the deleted package from the state
      setPackages((prevPackages) =>
        prevPackages.filter((pkg) => pkg._id !== packageId)
      );
    } catch (error) {
      console.error("Error deleting package:", error);
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
              <IconButton edge="end" aria-label="delete" onClick={() => deletePackage(pkg._id)}>
                <DeleteIcon color="error" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ManagePackages;
