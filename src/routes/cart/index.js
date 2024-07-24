const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler.js");
const cartController = require("../../controllers/cart.controller");
const { authentication } = require("../../auth/authUtils.js");
const router = express.Router();

router.post("", asyncHandler(cartController.addToCart));
router.delete("", asyncHandler(cartController.deleteProductInCart));
router.patch("", asyncHandler(cartController.updateCart));
router.get("", asyncHandler(cartController.getUserCart));

module.exports = router;
