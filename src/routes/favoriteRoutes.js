const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const { authenticateJWT } = require("../middlewares/authMiddleware");


router.post("/events/:id/favorite", authenticateJWT, favoriteController.addFavorite);
router.delete("/events/:id/favorite", authenticateJWT, favoriteController.removeFavorite);
router.get("/me/favorites", authenticateJWT, favoriteController.getFavorites);

module.exports = router;
