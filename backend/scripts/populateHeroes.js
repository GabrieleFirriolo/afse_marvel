const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { getHeroes } = require('../config/marvelApi');
const Hero = require('../models/Hero');

dotenv.config();

// const calculateRarity = (hero) => {
//   const totalAppearances = hero.series.available + hero.events.available + hero.comics.available + hero.stories.available;

//   if (totalAppearances > 100) {
//     return 'legendary';
//   } else if (totalAppearances > 50) {
//     return 'epic';
//   } else if (totalAppearances > 20) {
//     return 'rare';
//   } else if (totalAppearances > 10) {
//     return 'uncommon';
//   } else {
//     return 'common';
//   }
// };
const rarityPercentages = {
  legendary: 0.01,
  epic: 0.04,
  rare: 0.10,
  uncommon: 0.25,
  common: 0.60
};

const calculateRarity = () => {
  const rand = Math.random();
  if (rand < rarityPercentages.legendary) return 'legendary';
  if (rand < rarityPercentages.legendary + rarityPercentages.epic) return 'epic';
  if (rand < rarityPercentages.legendary + rarityPercentages.epic + rarityPercentages.rare) return 'rare';
  if (rand < rarityPercentages.legendary + rarityPercentages.epic + rarityPercentages.rare + rarityPercentages.uncommon) return 'uncommon';
  return 'common';
};

const populateHeroes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const heroes = await getHeroes();
    const heroDocs = heroes.map(hero => ({
      marvelId: hero.id,
      name: hero.name,
      description: hero.description,
      image: `${hero.thumbnail.path}.${hero.thumbnail.extension}`,
      series: hero.series.available,
      events: hero.events.available,
      stories: hero.stories.available,
      comics: hero.comics.available,
      rarity: calculateRarity(hero)
    }));

    await Hero.insertMany(heroDocs);
    console.log('Heroes populated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error populating heroes:', error);
    process.exit(1);
  }
};

populateHeroes();
