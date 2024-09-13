// utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Adjust baseURL according to your server setup
});

// Add a request interceptor to include the token in requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token to every request
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getHeroById = (id) => {
  const response = API.get(`/heroes/${id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching hero:", error);
      throw error;
    });

  return response;
};

export const getHeroes = async (searchTerm = "") => {
  try {
    const response = await API.get(`/heroes/search`, {
      params: {
        searchTerm,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    console.error("Error fetching heroes:", error);
    throw error;
  }
};

export const getUserStats = (userId) => {
  if (!userId) {
    userId = localStorage.getItem("id");
  }
  const response = API.get(`/users/stats/${userId}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching user stats:", error);
      throw error;
    });

  return response;
};

export const updateUserProfile = async (userId, updatedProfile) => {
  if (!userId) {
    userId = localStorage.getItem("id");
  }
  try {
    const response = await API.put(`/users/update-user`, {
      userId, // Include userId in the body
      ...updatedProfile,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export default API;
