const Trade = require("../models/Trade");
const User = require("../models/User");
const Hero = require("../models/Hero");

// Proposta di scambio
const proposeTrade = async (req, res) => {
  const {
    proposer,
    proposedHeroes,
    requestedHeroes,
    proposedCredits,
    requestedCredits,
    name,
  } = req.body;
  try {
    if (proposedHeroes.length === 0 || requestedHeroes.length === 0) {
      return res
        .status(400)
        .json({ error: "No heroes selected.", trade: null });
    }

    // Verifica che l'utente possieda le figurine proposte
    const user = await User.findById(proposer).populate("album.hero");
    for (let heroId of proposedHeroes) {
      const heroInAlbum = user.album.find(
        (entry) => entry.hero._id.toString() === heroId
      );
      if (!heroInAlbum || heroInAlbum.count <= 0) {
        return res
          .status(400)
          .json({ error: "You do not own one or more proposed heroes" });
      }
    }
    // Temporaneamente rimuovi gli eroi proposti dall'album
    proposedHeroes.forEach((heroId) => {
      const heroInAlbum = user.album.find(
        (entry) => entry.hero._id.toString() === heroId
      );
      if (heroInAlbum) {
        heroInAlbum.count -= 1;
        if (heroInAlbum.count <= 0) {
          user.album = user.album.filter(
            (entry) => entry.hero._id.toString() !== heroId
          );
        }
      }
    });

    // Rimuovi i crediti proposti dall'utente
    if (proposedCredits > 0) {
      if (user.credits < proposedCredits) {
        return res
          .status(400)
          .json({ error: "Insufficient credits to propose this trade" });
      }
      user.credits -= proposedCredits;
    }

    await user.save();
    //
    const trade = new Trade({
      proposer,
      proposedHeroes,
      requestedHeroes,
      proposedCredits,
      requestedCredits,
      name,
    });
    await trade.save();
    res.status(201).json({ message: "Trade proposed successfully", trade });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Accettazione dello scambio
const acceptTrade = async (req, res) => {
  const { tradeId } = req.params;
  const { acceptorId } = req.body;

  try {
    const trade = await Trade.findById(tradeId).populate(
      "proposedHeroes requestedHeroes proposer"
    );
    if (!trade) return res.status(404).json({ error: "Trade not found" });

    const acceptor = await User.findById(acceptorId).populate("album.hero");
    // Verifica che l'utente accettante possieda effettivamente le figurine richieste
    for (let hero of trade.requestedHeroes) {
      const heroInAlbum = acceptor.album.find(
        (entry) => entry.hero._id.toString() === hero._id.toString()
      );
      if (!heroInAlbum || heroInAlbum.count <= 0) {
        return res
          .status(400)
          .json({ error: "You do not own one or more requested heroes" });
      }
    }

    // Verifica che l'utente accettante non possieda già le figurine proposte dal proponente
    for (let hero of trade.proposedHeroes) {
      if (
        acceptor.album.find(
          (entry) => entry.hero._id.toString() === hero._id.toString()
        )
      ) {
        return res
          .status(400)
          .json({ error: "You already own one or more proposed heroes" });
      }
    }

    // // Aggiorna gli album degli utenti
    // const proposer = await User.findById(trade.proposer._id).populate(
    //   "album.hero"
    // );

    // // Rimuove gli eroi proposti dall'album del proponente e aggiunge quelli richiesti
    // trade.proposedHeroes.forEach((hero) => {
    //   const heroInAlbum = proposer.album.find(
    //     (entry) => entry.hero._id.toString() === hero._id.toString()
    //   );
    //   if (heroInAlbum) {
    //     heroInAlbum.count -= 1;
    //     if (heroInAlbum.count <= 0) {
    //       proposer.album = proposer.album.filter(
    //         (entry) => entry.hero._id.toString() !== hero._id.toString()
    //       );
    //     }
    //   }
    // });
    // trade.requestedHeroes.forEach((hero) => {
    //   const heroInAlbum = proposer.album.find(
    //     (entry) => entry.hero._id.toString() === hero._id.toString()
    //   );
    //   if (heroInAlbum) {
    //     heroInAlbum.count += 1;
    //   } else {
    //     proposer.album.push({ hero: hero._id, count: 1 });
    //   }
    // });

    // Rimuove gli eroi richiesti dall'album dell'accettante e aggiunge quelli proposti
    trade.requestedHeroes.forEach((hero) => {
      const heroInAlbum = acceptor.album.find(
        (entry) => entry.hero._id.toString() === hero._id.toString()
      );
      if (heroInAlbum) {
        heroInAlbum.count -= 1;
        if (heroInAlbum.count <= 0) {
          acceptor.album = acceptor.album.filter(
            (entry) => entry.hero._id.toString() !== hero._id.toString()
          );
        }
      }
    });
    trade.proposedHeroes.forEach((hero) => {
      const heroInAlbum = acceptor.album.find(
        (entry) => entry.hero._id.toString() === hero._id.toString()
      );
      if (heroInAlbum) {
        heroInAlbum.count += 1;
      } else {
        acceptor.album.push({ hero: hero._id, count: 1 });
      }
    });

    // Gestione dei crediti
    if (trade.proposedCredits >= 0 && trade.requestedCredits >= 0) {
      // console.log(trade.proposedCredits, trade.requestedCredits);
      // proposer.credits -= Number(trade.proposedCredits);
      acceptor.credits -= Number(trade.requestedCredits);

      // proposer.credits += Number(trade.requestedCredits);
      acceptor.credits += Number(trade.proposedCredits);
      if (acceptor.credits < 0) {
        return res.status(400).json({ error: "Insufficient credits" });
      }
    } else {
      // Handle the case where either proposedCredits or requestedCredits is not provided or is 0
      return res
        .status(400)
        .json({ error: "Invalid proposedCredits or requestedCredits" });
    }

    // Salvataggio delle modifiche
    await trade.proposer.save();
    await acceptor.save();

    // Aggiornamento dello stato dello scambio
    trade.status = "accepted";
    trade.acceptor = acceptorId;
    await trade.save();

    res.status(200).json({ message: "Trade accepted successfully", trade });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// TODO:
// Modifica dello scambio

// Rimozione di uno scambio ancora pending
const deleteTrade = async (req, res) => {
  const { tradeId } = req.params;
  const { userId } = req.body; // Assumi che l'ID dell'utente che richiede la cancellazione sia passato nel corpo della richiesta
  try {
    // Trova lo scambio da cancellare
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    // Verifica che l'utente che richiede la cancellazione sia il proponente dello scambio
    if (trade.proposer._id.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this trade" });
    }
    //
    const proposer = await User.findById(trade.proposer._id).populate(
      "album.hero"
    );

    // Riaggiungi le carte proposte all'album del proponente
    trade.proposedHeroes.forEach((hero) => {
      const heroInAlbum = proposer.album.find(
        (entry) => entry.hero._id.toString() === hero._id.toString()
      );
      if (heroInAlbum) {
        heroInAlbum.count += 1;
      } else {
        proposer.album.push({ hero: hero._id, count: 1 });
      }
    });

    // Riaggiungi i crediti proposti al proponente
    if (trade.proposedCredits > 0) {
      proposer.credits += trade.proposedCredits;
    }
    await proposer.save();

    //
    // Cancella lo scambio
    await Trade.findByIdAndDelete(tradeId);
    res.status(200).json({ message: "Trade deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Ottieni gli ultimi 15 trade proposti
const getLatestTrades = async (req, res) => {
  try {
    const trades = await Trade.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("proposedHeroes requestedHeroes proposer");
    res.json({ trades });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getTradeCards = async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, search = "", type } = req.query;

  try {
    // Trova l'utente e popola il campo album.hero
    const user = await User.findById(userId).populate("album.hero");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filtra gli eroi con il nome che corrisponde al parametro di ricerca
    const searchRegex = new RegExp(search, "i"); // RegExp case-insensitive

    const allHeroes = await Hero.find({ name: searchRegex });

    const ownedHeroIds = user.album.map((entry) => entry.hero._id.toString());

    // Filtrare le carte in base al tipo
    let limitedCards = [];
    if (type === "offer") {
      const ownedCards = user.album
        .filter((entry) => searchRegex.test(entry.hero.name)) // Filtraggio delle carte offerte
        .map((entry) => ({
          _id: entry.hero._id,
          name: entry.hero.name,
          rarity: entry.hero.rarity,
          image: entry.hero.image,
          quantity: entry.count,
        }));
      limitedCards = ownedCards.slice(0, limit);
    } else if (type === "request") {
      const availableCards = allHeroes
        .filter((hero) => !ownedHeroIds.includes(hero._id.toString()))
        .map((hero) => ({
          _id: hero._id,
          name: hero.name,
          rarity: hero.rarity,
          image: hero.image,
        }));
      limitedCards = availableCards.slice(0, limit);
    } else {
      return res.status(400).json({ error: "Invalid type parameter" });
    }
    // Risposta JSON
    res.json({ cards: limitedCards });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllTrades = async (req, res) => {
  try {
    const trades = await Trade.find({ status: "pending" }).populate(
      "proposedHeroes requestedHeroes proposer acceptor"
    );
    res.json({ trades });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  proposeTrade,
  acceptTrade,
  getLatestTrades,
  getTradeCards,
  getAllTrades,
  deleteTrade,
};
