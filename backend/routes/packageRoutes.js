const express = require("express");
const {
  createPackageType,
  togglePackageType,
  deletePackageType,
  buyPackage,
  openPackage,
  getFeaturedPackages,
  getAvailablePackagesTypes,
  getAllPackagesTypes,
} = require("../controllers/packageController");
const router = express.Router();
const { adminOnly } = require("../middleware/authMiddleware");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Packages
 *   description: Package management
 */

/**
 * @swagger
 * /api/packages/create-package-type:
 *   post:
 *     summary: Create a new package type
 *     tags: [Packages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               numberOfHeroes:
 *                 type: number
 *               guaranteedRares:
 *                 type: number
 *               guaranteedEpics:
 *                 type: number
 *               guaranteedLegendary:
 *                 type: number
 *               createdBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Package type created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-package-type", adminOnly, createPackageType); // Accessibile solo dagli admin

/**
 * @swagger
 * /api/packages/delete-package-type/{packageId}:
 *   delete:
 *     summary: Delete a package type
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The package type ID
 *     responses:
 *       200:
 *         description: Package type deleted successfully
 *       404:
 *         description: Package type not found
 *       500:
 *         description: Server error
 */
router.delete("/delete-package-type/:packageId", protect, deletePackageType);

/**
 * @swagger
 * /api/packages/buy:
 *   post:
 *     summary: Buy a package
 *     tags: [Packages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               packageTypeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Package bought successfully
 *       400:
 *         description: Bad request
 */
router.post("/buy", protect, buyPackage);

/**
 * @swagger
 * /api/packages/open:
 *   post:
 *     summary: Open a package
 *     tags: [Packages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               packageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Package opened successfully
 *       400:
 *         description: Bad request
 */
router.post("/open", protect, openPackage);

/**
 * @swagger
 * /api/packages/featured:
 *   get:
 *     summary: Get featured packages
 *     tags: [Packages]
 *     responses:
 *       200:
 *         description: List of featured packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   packageId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   numberOfHeroes:
 *                     type: number
 *                   guaranteedRares:
 *                     type: number
 *                   guaranteedEpics:
 *                     type: number
 *                   guaranteedLegendary:
 *                     type: number
 *       400:
 *         description: Bad request
 */
router.get("/featured", protect, getFeaturedPackages);

/**
 * @swagger
 * /api/packages/toggle-package-type/{id}:
 *   put:
 *     summary: Toggle package type availability status
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The package type ID
 *     responses:
 *       200:
 *         description: Package availability updated
 *       404:
 *         description: Package not found
 *       500:
 *         description: Server error
 */
router.put("/toggle-package-type/:id", adminOnly, togglePackageType);

/**
 * @swagger
 * /api/packages/all-package-types:
 *   get:
 *     summary: Get all package types
 *     tags: [Packages]
 *     responses:
 *       200:
 *         description: List of all package types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   packageTypeId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   numberOfHeroes:
 *                     type: number
 *                   guaranteedRares:
 *                     type: number
 *                   guaranteedEpics:
 *                     type: number
 *                   guaranteedLegendary:
 *                     type: number
 *       500:
 *         description: Failed to fetch packages
 */
router.get("/all-package-types", adminOnly, getAllPackagesTypes);

/**
 * @swagger
 * /api/packages/package-types:
 *   get:
 *     summary: Get available package types
 *     tags: [Packages]
 *     responses:
 *       200:
 *         description: List of available package types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   packageTypeId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   numberOfHeroes:
 *                     type: number
 *                   guaranteedRares:
 *                     type: number
 *                   guaranteedEpics:
 *                     type: number
 *                   guaranteedLegendary:
 *                     type: number
 *       500:
 *         description: Failed to fetch packages
 */
router.get("/package-types", protect, getAvailablePackagesTypes);
module.exports = router;
