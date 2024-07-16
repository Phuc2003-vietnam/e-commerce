const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler.js");
const accessController = require("../../controllers/access.controller");
const { authentication } = require("../../auth/authUtils.js");
const router = express.Router();

router.post("/shop/login", asyncHandler(accessController.login));
router.post("/shop/signup", asyncHandler(accessController.signUp));

router.use(authentication);

router.post("/shop/logout", asyncHandler(accessController.logout));
router.post("/shop/handlerRefreshToken", asyncHandler(accessController.handlerRefreshToken));

module.exports = router;
