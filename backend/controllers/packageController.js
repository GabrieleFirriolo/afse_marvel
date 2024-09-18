const Package = require("../models/Package");
const PackageType = require("../models/PackageType");
const Hero = require("../models/Hero");
const User = require("../models/User");

const getGuaranteedHeroes = async (rarity, numHeroes) => {
  return await Hero.aggregate([
    { $match: { rarity: rarity } },
    { $sample: { size: numHeroes } },
  ]);
};

const getRandomHeroes = async (numHeroes, guaranteed = {}) => {
  const rarities = [
    { rarity: "common", percentage: 0.6 },
    { rarity: "uncommon", percentage: 0.25 },
    { rarity: "rare", percentage: 0.1 },
    { rarity: "epic", percentage: 0.04 },
    { rarity: "legendary", percentage: 0.01 },
  ];

  let heroes = [];

  // Aggiungere eroi garantiti
  for (const [rarity, count] of Object.entries(guaranteed)) {
    if (count > 0) {
      const guaranteedHeroes = await getGuaranteedHeroes(rarity, count);
      heroes = heroes.concat(guaranteedHeroes);
      numHeroes -= count;
    }
  }

  // Aggiungere eroi rimanenti
  for (let i = 0; i < numHeroes; i++) {
    const rand = Math.random();
    let cumulativePercentage = 0;

    for (let rarity of rarities) {
      cumulativePercentage += rarity.percentage;
      if (rand < cumulativePercentage) {
        const hero = await Hero.aggregate([
          { $match: { rarity: rarity.rarity } },
          { $sample: { size: 1 } },
        ]);
        if (hero.length > 0) {
          heroes.push(hero[0]);
        }
        break;
      }
    }
  }

  return heroes;
};

// Creazione di un nuovo tipo di pacchetto (Admin)
const createPackageType = async (req, res) => {
  const {
    name,
    description,
    price,
    numberOfHeroes,
    guaranteedRare,
    guaranteedEpic,
    guaranteedLegendary,
    createdBy,
  } = req.body;
  try {
    const packageType = new PackageType({
      name,
      description,
      price,
      numberOfHeroes,
      guaranteedRare,
      guaranteedEpic,
      guaranteedLegendary,
      createdBy,
    });
    await packageType.save();
    res
      .status(201)
      .json({ message: "Package type created successfully", packageType });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

// Acquisto di un pacchetto
const buyPackage = async (req, res) => {
  const { userId, packageTypeId, quantity } = req.body;

  try {
    const user = await User.findById(userId);
    const packageType = await PackageType.findById(packageTypeId);
    if (quantity < 1){
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }
    const totalPrice = packageType.price * quantity;
    console.log(user.credits, totalPrice);
    if (user.credits < totalPrice) {
      return res.status(400).json({ error: "Not enough credits" });
    }

    const newPackages = [];

    for (let i = 0; i < quantity; i++) {
      const newPackage = new Package({
        user: userId,
        packageType: packageTypeId,
      });

      newPackages.push(newPackage);
    }

    user.credits -= totalPrice;
    await user.save();
    await Promise.all(
      newPackages.map(async (newPackage) => await newPackage.save())
    );

    res.status(201).json({ message: "Packages bought successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Apertura di un pacchetto
const openPackage = async (req, res) => {
  const { userId, packageId } = req.body;

  try {
    const user = await User.findById(userId);
    const package = await Package.findById(packageId).populate("heroes");

    const packageType = await PackageType.findById(package.packageType);
    if (!package || package.user.toString() !== userId) {
      return res.status(400).json({ error: "Invalid package" });
    }

    if (package.opened) {
      return res.status(400).json({ error: "Package already opened" });
    }

    const guaranteed = {
      rare: packageType.guaranteedRare,
      epic: packageType.guaranteedEpic,
      legendary: packageType.guaranteedLegendary,
    };

    const heroes = await getRandomHeroes(
      packageType.numberOfHeroes,
      guaranteed
    );

    // Aggiornamento dell'album dell'utente
    heroes.forEach((hero) => {
      const existingEntry = user.album.find(
        (entry) => entry.hero.toString() === hero._id.toString()
      );
      if (existingEntry) {
        existingEntry.count += 1;
      } else {
        user.album.push({ hero: hero._id, count: 1 });
      }
    });

    package.opened = true;
    package.heroes = heroes.map((hero) => hero._id);
    await user.save();
    await package.save();

    res.status(200).json({
      message: "Package opened successfully",
      package: heroes,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// Funzione per aprire tutti i pacchetti e poi eliminare il pacchetto
const deletePackageType = async (req, res) => {
  const { packageId } = req.params;

  try {
    // Trova tutti i pacchetti non aperti associati a questo packageType
    const unopenedPackages = await Package.find({
      packageType: packageId,
      opened: false,
    });
    if (unopenedPackages === null) {
      return res.status(404).json({ error: "No unopened packages found" });
    }

    // Apri tutti i pacchetti non aperti
    for (const unopenedPackage of unopenedPackages) {
      const user = await User.findById(unopenedPackage.user);
      const packageType = await PackageType.findById(unopenedPackage.packageType);

      const guaranteed = {
        rare: packageType.guaranteedRare,
        epic: packageType.guaranteedEpic,
        legendary: packageType.guaranteedLegendary,
      };

      const heroes = await getRandomHeroes(packageType.numberOfHeroes, guaranteed);

      // Aggiorna l'album dell'utente
      heroes.forEach((hero) => {
        const existingEntry = user.album.find(
          (entry) => entry.hero.toString() === hero._id.toString()
        );
        if (existingEntry) {
          existingEntry.count += 1;
        } else {
          user.album.push({ hero: hero._id, count: 1 });
        }
      });

      unopenedPackage.opened = true;
      unopenedPackage.heroes = heroes.map((hero) => hero._id);

      // Salva le modifiche
      await user.save();
      await unopenedPackage.save();
    }

    // Elimina il pacchetto dal database
    await PackageType.findByIdAndDelete(packageId);
    await Package.deleteMany({ packageType: packageId }); // Rimuovi anche tutti i pacchetti legati a questo tipo

    res.status(200).json({ message: "Package and associated unopened packages deleted successfully" });
  } catch (error) {
    console.error("Error deleting package type:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// Prendi tutti i tipi di pacchetti "featured"
const getFeaturedPackages = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const featuredPackages = await PackageType.find({
      isAvailable: true,
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json(featuredPackages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch featured packages" });
  }
};

const togglePackageType = async (req, res) => {
  const  packageId  = req.params.id;
  console.log(packageId);
  try {
    const packageType = await PackageType.findById(packageId);
    if (!packageType) {
      return res.status(404).json({ message: "Package not found" });
    }
    packageType.isAvailable = !packageType.isAvailable;
    await packageType.save();
    res
      .status(200)
      .json({ message: "Package availability updated", package: packageType });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getAvailablePackagesTypes = async (req, res) => {
  try {
    const availablePackages = await PackageType.find({ isAvailable: true });
    res.status(200).json(availablePackages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch packages" });
  }
};

const getAllPackagesTypes = async (req, res) => {
  try {
    const packages = await PackageType.find();
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch packages" });
  }
};

module.exports = {
  createPackageType,
  togglePackageType,
  buyPackage,
  openPackage,
  getFeaturedPackages,
  getAvailablePackagesTypes,
  getAllPackagesTypes,
  deletePackageType
};
