const express = require("express");

const {
  getHomepageStats,
} = require("../../controller/homePage/homepage.controller");

const router = express.Router();

router.get("/homepage-stats", getHomepageStats);

module.exports = router;