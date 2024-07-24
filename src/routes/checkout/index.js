const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler.js");
const checkoutController = require("../../controllers/checkout.controller");
const { authentication } = require("../../auth/authUtils.js");
const router = express.Router();

router.get("/review", asyncHandler(checkoutController.checkoutReview));

module.exports = router;
