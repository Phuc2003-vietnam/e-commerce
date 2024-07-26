const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler.js");
const inventoryController = require("../../controllers/inventory.controller");
const { authentication } = require("../../auth/authUtils.js");
const router = express.Router();

router.use(authentication)
router.get("/review", asyncHandler(inventoryController.checkoutReview));

module.exports = router;
