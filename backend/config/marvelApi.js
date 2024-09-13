const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const MARVEL_API_URL = 'https://gateway.marvel.com/v1/public';
const API_KEY = process.env.MARVEL_API_KEY;
const PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY;

const getHeroes = async () => {
  try {
    const ts = new Date().getTime();
    const hash = require('crypto')
      .createHash('md5')
      .update(ts + PRIVATE_KEY + API_KEY)
      .digest('hex');

    const response = await axios.get(`${MARVEL_API_URL}/characters?offset=500`, {
      params: {
        ts,
        apikey: API_KEY,
        hash,
      },
      timeout: 999, // 5 seconds timeout
    });
    return response.data.data.results;
  } catch (error) {
    console.error('Error fetching heroes from Marvel API:', error);
    throw error;
  }
};

module.exports = { getHeroes };
