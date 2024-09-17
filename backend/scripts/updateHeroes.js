const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hero = require('../models/Hero');

dotenv.config();

// Percentuali desiderate
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
  
const updateRarities = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const heroes = await Hero.find();
    const updatePromises = heroes.map(async (hero) => {
    //   const newRarity = calculateRarity(hero);
      return Hero.updateOne({ _id: hero._id }, { rarity: calculateRarity() });
    });

    await Promise.all(updatePromises);
    console.log('Rarities updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating rarities:', error);
    process.exit(1);
  }
};

updateRarities();
