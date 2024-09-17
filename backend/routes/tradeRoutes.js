const express = require("express");
const {
  proposeTrade,
  acceptTrade,
  getLatestTrades,
  getTradeCards,
  getAllTrades,
  deleteTrade,
} = require("../controllers/tradeController");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Trades
 *   description: Trade management
 */

/**
 * @swagger
 * /api/trades/propose:
 *   post:
 *     summary: Propose a trade
 *     tags: [Trades]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proposer:
 *                 type: string
 *                 description: ID of the user proposing the trade
 *                 example: "60d0fe4f5311236168a109ca"
 *               proposedHeroes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of IDs of the heroes proposed for the trade
 *                 example: ["60d0fe4f5311236168a109cb", "60d0fe4f5311236168a109cc"]
 *               requestedHeroes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of IDs of the heroes requested in exchange
 *                 example: ["60d0fe4f5311236168a109cd", "60d0fe4f5311236168a109ce"]
 *               credits:
 *                 type: number
 *                 description: Number of credits offered in the trade
 *                 example: 100
 *     responses:
 *       201:
 *         description: Trade proposed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 trade:
 *                   $ref: '#/models/Trade'
 *       400:
 *         description: Bad request
 */
router.post("/propose", protect, proposeTrade);

/**
 * @swagger
 * /api/trades/accept/{tradeId}:
 *   put:
 *     summary: Accept a trade
 *     tags: [Trades]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the trade to accept
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               acceptorId:
 *                 type: string
 *                 description: ID of the user accepting the trade
 *                 example: "60d0fe4f5311236168a109cf"
 *     responses:
 *       200:
 *         description: Trade accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 trade:
 *                   $ref: '#/models/Trade'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Trade not found
 */
router.put("/accept/:tradeId", protect, acceptTrade);

/**
 * @swagger
 * /api/trades/latest:
 *   get:
 *     summary: Get the latest 15 proposed trades
 *     tags: [Trades]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of the latest trades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trades:
 *                   type: array
 *                   items:
 *                     $ref: '#/models/Trade'
 *       500:
 *         description: Server error
 */
router.get("/latest", getLatestTrades);


/**
 * @swagger
 * /api/trades/trade-cards/{userId}:
 *   get:
 *     summary: Get tradeable cards for a user
 *     tags: [Trades]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         required: false
 *         description: Limit the number of cards returned
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term for filtering cards by name
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [offer, request]
 *         required: true
 *         description: Type of cards to return ('offer' for cards the user owns, 'request' for cards the user doesn't own)
 *     responses:
 *       200:
 *         description: List of tradeable cards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       rarity:
 *                         type: string
 *                       image:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                         description: Quantity of the card owned (only for 'offer' type)
 *       400:
 *         description: Invalid type parameter or other bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/trade-cards/:userId", getTradeCards);


/**
 * @swagger
 * /api/trades/delete/{tradeId}:
 *   post:
 *     summary: Delete a pending trade
 *     tags: [Trades]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the trade to delete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user requesting the deletion (must be the proposer)
 *                 example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: Trade deleted successfully
 *       400:
 *         description: Bad request or unauthorized to delete the trade
 *       404:
 *         description: Trade not found
 *       500:
 *         description: Server error
 */
router.post("/delete/:tradeId", protect, deleteTrade);

/**
 * @swagger
 * /api/trades/all:
 *   get:
 *     summary: Get all pending trades
 *     tags: [Trades]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all pending trades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trades:
 *                   type: array
 *                   items:
 *                     $ref: '#/models/Trade'
 *       500:
 *         description: Server error
 */
router.get("/all", getAllTrades);

module.exports = router;
