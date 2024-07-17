const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler.js");
const productController = require("../../controllers/product.controller");
const { authentication } = require("../../auth/authUtils.js");
const router = express.Router();

router.use(authentication);

router.post("", asyncHandler(productController.createProduct));

module.exports = router;
