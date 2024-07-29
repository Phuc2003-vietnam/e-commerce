const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler.js");
const notificationController = require("../../controllers/notification.controller");
const { authentication } = require("../../auth/authUtils.js");
const router = express.Router();

router.use(authentication)
router.get("", asyncHandler(notificationController.listNotiByUser));

module.exports = router;
