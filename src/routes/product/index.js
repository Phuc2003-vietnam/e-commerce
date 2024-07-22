const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler.js");
const productController = require("../../controllers/product.controller");
const { authentication } = require("../../auth/authUtils.js");
const router = express.Router();

router.get("", asyncHandler(productController.getAllProducts));
router.get("/:product_id", asyncHandler(productController.getProduct));
router.get("/search/:keySearch", asyncHandler(productController.getListSearchProduct));

router.use(authentication);
router.post("/publish/:id", asyncHandler(productController.publishProductByShop));
router.post("/unpublish/:id", asyncHandler(productController.unPublishProductByShop));

router.patch("/:product_id", asyncHandler(productController.updateProduct));

// QUERY //
router.post("", asyncHandler(productController.createProduct));
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get("/published/all", asyncHandler(productController.getAllPublishForShop));

module.exports = router;
