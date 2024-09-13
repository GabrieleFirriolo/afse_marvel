const express = require("express");
const {
  getAllHeroes,
  getHeroById,
  getHeroes,
  getHeroComics,
  getHeroStories,
  getHeroEvents,
  getHeroSeries,
} = require("../controllers/heroController");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Heroes
 *   description: Hero management
 */

/**
 * @swagger
 * /api/heroes:
 *   get:
 *     summary: Get all heroes
 *     tags: [Heroes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all heroes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   marvelId:
 *                     type: number
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   image:
 *                     type: string
 *                   series:
 *                     type: array
 *                     items:
 *                       type: string
 *                   events:
 *                     type: array
 *                     items:
 *                       type: string
 *                   comics:
 *                     type: array
 *                     items:
 *                       type: string
 */
router.get("/", protect, getAllHeroes);

/**
 * @swagger
 * /api/heroes/search:
 *   get:
 *     summary: Search for heroes
 *     tags: [Heroes]
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         required: false
 *         description: Term to search heroes by name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         required: false
 *         description: Limit the number of heroes returned
 *     responses:
 *       200:
 *         description: List of heroes matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   image:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get("/search", getHeroes);

/**
 * @swagger
 * /api/heroes/{id}:
 *   get:
 *     summary: Get a hero by ID
 *     tags: [Heroes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hero ID
 *     responses:
 *       200:
 *         description: The hero data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 marvelId:
 *                   type: number
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 image:
 *                   type: string
 *                 series:
 *                   type: array
 *                   items:
 *                     type: string
 *                 events:
 *                   type: array
 *                   items:
 *                     type: string
 *                 comics:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Hero not found
 */
router.get("/:id", protect, getHeroById);

/**
 * @swagger
 * /api/heroes/comics/{id}:
 *   get:
 *     summary: Get hero comics
 *     tags: [Heroes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hero ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term to filter comics by title
 *     responses:
 *       200:
 *         description: The hero comics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       issueNumber:
 *                         type: number
 *                 total:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.get("/comics/:id", protect, getHeroComics);

/**
 * @swagger
 * /api/heroes/stories/{id}:
 *   get:
 *     summary: Get hero stories
 *     tags: [Heroes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hero ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term to filter stories by title
 *     responses:
 *       200:
 *         description: The hero stories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       issueNumber:
 *                         type: number
 *                 total:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.get("/stories/:id", protect, getHeroStories);

/**
 * @swagger
 * /api/heroes/events/{id}:
 *   get:
 *     summary: Get hero events
 *     tags: [Heroes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hero ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term to filter events by title
 *     responses:
 *       200:
 *         description: The hero events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       issueNumber:
 *                         type: number
 *                 total:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.get("/events/:id", protect, getHeroEvents);

/**
 * @swagger
 * /api/heroes/series/{id}:
 *   get:
 *     summary: Get hero series
 *     tags: [Heroes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hero ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term to filter series by title
 *     responses:
 *       200:
 *         description: The hero series
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       issueNumber:
 *                         type: number
 *                 total:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.get("/series/:id", protect, getHeroSeries);

module.exports = router;
