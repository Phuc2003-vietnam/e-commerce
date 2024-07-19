const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler.js");
const productController = require("../../controllers/product.controller");
const { authentication } = require("../../auth/authUtils.js");
const router = express.Router();


router.get("/search/:keySearch", asyncHandler(productController.getListSearchProduct));

router.use(authentication);
router.put("/publish/:id", asyncHandler(productController.publishProductByShop));
router.put("/unpublish/:id", asyncHandler(productController.unPublishProductByShop));

// QUERY //
router.post("", asyncHandler(productController.createProduct));
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get("/published/all", asyncHandler(productController.getAllPublishForShop));

module.exports = router;
