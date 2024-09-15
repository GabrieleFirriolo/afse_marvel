const Hero = require("../models/Hero");

// Ottieni tutti gli eroi
const getAllHeroes = async (req, res) => {
  try {
    const heroes = await Hero.find({});
    res.status(200).json(heroes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Ottieni eroi filtrati
const getHeroes = async (req, res) => {
  const { searchTerm = "", limit = 7 } = req.query;
  try {
    const heroes = await Hero.find({
      name: { $regex: searchTerm, $options: "i" },
    })
      .limit(Number(limit))
      .select("name image");

    res.status(200).json(heroes);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
const dotenv = require("dotenv");
dotenv.config();

const MARVEL_API_BASE_URL = "https://gateway.marvel.com/v1/public";
const API_KEY = process.env.MARVEL_API_KEY;
const PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY;
const axios = require("axios");
// Funzione generica per fetchare dati dal Marvel API
const fetchMarvelData = async (resource, heroId, page, search) => {
  const limit = 6;
  const offset = (page - 1) * limit;
  const ts = new Date().getTime();
  const hash = require("crypto")
    .createHash("md5")
    .update(ts + PRIVATE_KEY + API_KEY)
    .digest("hex");
  const params = {
    ts,
    apikey: API_KEY,
    hash,
    limit,
    offset,
    ...(search && { titleStartsWith: search }),
  };

  try {
    const response = await axios.get(
      `${MARVEL_API_BASE_URL}/characters/${heroId}/${resource}`,
      { params }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${resource}:`, error.message);
    throw new Error(`Failed to fetch ${resource}`);
  }
};

// Endpoint per fetchare i comics
const getHeroComics = async (req, res) => {
  const { id } = req.params;
  const { page = 1, search = "" } = req.query;

  try {
    const data = await fetchMarvelData("comics", id, page, search);
    res.json({
      results: data.results,
      total: data.total,
      totalPages: Math.ceil(data.total / 5),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint per fetchare le stories
const getHeroStories = async (req, res) => {
  const { id } = req.params;
  const { page = 1, search = "" } = req.query;

  try {
    const data = await fetchMarvelData("stories", id, page, search);
    res.json({
      results: data.results,
      total: data.total,
      totalPages: Math.ceil(data.total / 5),
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint per fetchare gli eventi
const getHeroEvents = async (req, res) => {
  const { id } = req.params;
  const { page = 1, search = "" } = req.query;

  try {
    const data = await fetchMarvelData("events", id, page, search);
    res.json({
      results: data.results,
      total: data.total,
      totalPages: Math.ceil(data.total / 5),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Endpoint per fetchare le series
const getHeroSeries = async (req, res) => {
  const { id } = req.params;
  const { page = 1, search = "" } = req.query;

  try {
    const data = await fetchMarvelData("series", id, page, search);
    res.json({
      results: data.results,
      total: data.total,
      totalPages: Math.ceil(data.total / 5),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getHeroById = async (req, res) => {
  const { id } = req.params;
  try {
    const hero = await Hero.findById(id);
    if (!hero) return res.status(404).json({ error: "Hero not found" });
    res.status(200).json(hero);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllHeroes,
  getHeroById,
  getHeroes,
  getHeroComics,
  getHeroStories,
  getHeroEvents,
  getHeroSeries,
};
