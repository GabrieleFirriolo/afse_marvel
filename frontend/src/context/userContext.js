import React, { createContext, useState, useEffect } from "react";
import API from "../utils/api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [album, setAlbum] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalCards, setTotalCards] = useState(0);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const id = localStorage.getItem("id");
        if (token) {
          const response = await API.get(`/users/profile/${id}`);
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const fetchAlbum = async (page, searchTerm, selectedRarity) => {
    if (!page) page = 1;
    if (!searchTerm) searchTerm = "";
    if (!selectedRarity) selectedRarity = "";
    try {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("id");
      if (token) {
        console.log(page, searchTerm, selectedRarity);
        const response = await API.get(
          `/users/album/${id}?page=${page}&searchTerm=${searchTerm}&selectedRarity=${selectedRarity}`
        );
        //setAlbum(response.data.album);
        setTotalCards(response.data.totalCards);
        //setTotalPages(response.totalPages);
        return response.data;
      }
    } catch (error) {
      console.error("Failed to fetch album:", error);
    }
  };

  //TODO:
  // da sostituire con quella in Package.js
  const fetchPackages = async () => {
    try {
      const id = localStorage.getItem("id");
      const response = await API.get(`/users/packages/${id}`);
      const packages = response.data.packages;

      // Raggruppa i pacchetti per packageType e conta le quantità
      const groupedPackages = packages.reduce((acc, pack) => {
        const typeId = pack.packageType._id;
        if (!acc[typeId]) {
          acc[typeId] = {
            ...pack.packageType,
            quantity: 1,
            _id: pack._id, // Use the first package _id for interaction
          };
        } else {
          acc[typeId].quantity += 1;
        }
        return acc;
      }, {});

      setPackages(Object.values(groupedPackages));
    } catch (error) {
      console.error("Error fetching packages:", error);
      setPackages([]); // Ensure packages is an array in case of error
    }
  };

  const sellHero = async (heroId) => {
    const id = localStorage.getItem("id");
    try {
      const response = await API.post(`/users/sell-hero`, {
        userId: id,
        heroId,
      });
      if (response.status >= 200 && response.status < 300) {
        setAlbum((prevAlbum) =>
          prevAlbum
            .map((album) =>
              album.hero._id === heroId
                ? { ...album, count: album.count - 1 }
                : album
            )
            .filter((album) => album.count > 0)
        );
        const updatedUser = {
          ...user,
          credits: response.data.user.credits,
        };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Failed to sell hero:", error);
    }
  };

  const buyPackage = async (packageId, quantity) => {
    const id = localStorage.getItem("id");
    try {
      const response = await API.post(`/packages/buy`, {
        userId: id,
        packageTypeId: packageId,
        quantity,
      });
      if (response.status >= 200 && response.status < 300) {
        const updatedUser = {
          ...user,
          credits: response.data.user.credits,
        };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Failed to buy package:", error);
    }
  };

  const openPackage = async (packageId) => {
    const id = localStorage.getItem("id");
    try {
      const response = await API.post("/packages/open", {
        userId: id,
        packageId,
      });
      if (response.status >= 200 && response.status < 300) {
        // Update album and packages state
        fetchAlbum();
        fetchPackages();
        // const updatedUser = {
        //   ...user,
        //   credits: response.data.user.credits,
        // };
        // setUser(updatedUser);
      }
      return response.data.package; // Return opened cards
    } catch (error) {
      console.error("Error opening package:", error);
      return [];
    }
  };

  const buyCredits = async (credits) => {
    const id = localStorage.getItem("id");
    try {
      const response = await API.post(`/users/purchase-credits`, {
        userId: id,
        credits: credits,
      });
      if (response.status >= 200 && response.status < 300) {
        console.log(response);
        const updatedUser = {
          ...user,
          credits: response.data.credits,
        };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Failed to buy credits:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        logout,
        setAlbum,
        setUser,
        album,
        fetchAlbum,
        loading,
        updateUser,
        sellHero,
        buyPackage,
        openPackage,
        fetchPackages,
        packages,
        buyCredits,
        totalCards,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
