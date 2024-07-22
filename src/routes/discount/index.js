const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler.js");
const discountController = require("../../controllers/discount.controller");
const { authentication } = require("../../auth/authUtils.js");
const router = express.Router();

router.get("/amount", asyncHandler(discountController.getDiscountAmount));
router.get("/list_product_code", asyncHandler(discountController.getAllProductAppliedByDiscount));

router.use(authentication);
router.post("", asyncHandler(discountController.createDsicountCode));
router.get("", asyncHandler(discountController.getAllDiscountCodes));


module.exports = router;
