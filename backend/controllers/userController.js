const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const {
  registerValidation,
  loginValidation,
} = require("../utils/validateUser");
const Hero = require("../models/Hero");
const Trade = require("../models/Trade");
const Package = require("../models/Package");
const mongoose = require("mongoose");
// Registrazione utente
const registerUser = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { username, email, password, favoriteHero, role } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ error: "Email already exists" });

    const user = new User({ username, email, password, favoriteHero, role });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favoriteHero: user.favoriteHero,
        role: user.role,
        credits: user.credits,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login utente
const loginUser = async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });
    console.log(await user.matchPassword(password));
    const validPassword = await user.matchPassword(password);
    if (!validPassword)
      return res.status(400).json({ error: "Invalid password" });

    const token = generateToken(user._id);

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favoriteHero: user.favoriteHero,
        role: user.role,
        credits: user.credits,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// Acquisto crediti
const purchaseCredits = async (req, res) => {
  const { userId, credits } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (credits < 1) {
      return res.status(400).json({ error: "Invalid credits amount" });
    }
    user.credits += credits;
    await user.save();
    res.status(200).json({
      message: "Credits purchased successfully",
      credits: user.credits,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const creditValues = {
  common: 0.2,
  uncommon: 0.5,
  rare: 1,
  epic: 2,
  legendary: 5,
};

// Vendita di un eroe per crediti
const sellHero = async (req, res) => {
  const { userId, heroId } = req.body;

  try {
    const user = await User.findById(userId);
    const hero = await Hero.findById(heroId);

    if (!user || !hero) {
      return res.status(404).json({ error: "User or Hero not found" });
    }

    // Trova l'entry dell'album per l'eroe
    const albumEntry = user.album.find(
      (entry) => entry.hero.toString() === heroId
    );
    if (!albumEntry || albumEntry.count < 1) {
      return res.status(400).json({ error: "Hero not found in user album" });
    }

    // Calcola i crediti per la rarità dell'eroe
    const credits = creditValues[hero.rarity] || 0;

    // Rimuove una copia dell'eroe dall'album
    albumEntry.count -= 1;
    if (albumEntry.count === 0) {
      user.album = user.album.filter(
        (entry) => entry.hero.toString() !== heroId
      );
    }

    // Aggiungi i crediti all'utente
    user.credits = parseFloat((user.credits + credits).toFixed(2));
    await user.save();

    res.status(200).json({ message: "Hero sold successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Modifica utente
const updateUser = async (req, res) => {
  const { userId, username, email, favoriteHero, password } = req.body;
  console.log(password);
  try {
    const user = await User.findById(userId).select("-password -album");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else {
      user.username = username;
      user.email = email;
      user.favoriteHero = favoriteHero;
      user.password = password;
      await user.save();
      res.status(200).json({ message: "User updated successfully", user });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select("-password -album");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getUserStats = async (req, res) => {
  const { userId } = req.params;
  try {
    // Find the user and populate the album to count the total cards
    const user = await User.findById(userId).select("-password");
    const totalCards = user.album.reduce(
      (total, item) => total + item.count,
      0
    );

    // Find the user's active trades
    const activeTrades = await Trade.countDocuments({
      proposer: userId,
      status: "pending",
    });
    console.log(activeTrades);
    res.json({ user, totalCards, activeTrades });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// const getUserAlbum = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const user = await User.findById(userId).populate('album.hero');
//     res.json({ album: user.album });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

const getUserAlbum = async (req, res) => {
  const { userId } = req.params;
  const {
    page = 1,
    searchTerm = "",
    selectedRarity = "",
    quantityOrder = "asc",
  } = req.query;
  const limit = 15;
  const skip = (page - 1) * limit; // Calculate the number of documents to skip
  console.log(page, searchTerm, selectedRarity);
  try {
    // Find the user's album
    const user = await User.findById(userId).populate("album.hero");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter the album based on search and rarity
    let filteredAlbum = user.album.filter((item) => {
      return (
        (!searchTerm ||
          item.hero.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!selectedRarity ||
          item.hero.rarity.toLowerCase() === selectedRarity.toLowerCase())
      );
    });

    // Ordina l'album in base alla quantità, tenendo conto del parametro quantityOrder
    filteredAlbum = filteredAlbum.sort((a, b) => {
      return quantityOrder === "asc" ? a.count - b.count : b.count - a.count;
    });

    // Paginate the filtered album
    const paginatedAlbum = filteredAlbum.slice(skip, skip + limit);

    // Total cards after filtering
    const totalCards = filteredAlbum.length;

    res.json({
      album: paginatedAlbum,
      totalCards: totalCards,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCards / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getUserTrades = async (req, res) => {
  const { userId } = req.params;
  try {
    const trades = await Trade.find({ proposer: userId, status: "pending" });
    res.json({ trades });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getUserPackages = async (req, res) => {
  const { userId } = req.params;
  try {
    const packages = await Package.find({
      user: userId,
      opened: false,
    }).populate("packageType");
    res.json({ packages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = {
  registerUser,
  loginUser,
  purchaseCredits,
  sellHero,
  updateUser,
  getUserProfile,
  getUserAlbum,
  getUserTrades,
  getUserPackages,
  getUserStats,
};
