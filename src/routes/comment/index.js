const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler.js");
const commentController = require("../../controllers/comment.controller");
const { authentication } = require("../../auth/authUtils.js");
const router = express.Router();

router.use(authentication)
router.post("", asyncHandler(commentController.createComment));
router.delete("", asyncHandler(commentController.deleteComment));
router.get("", asyncHandler(commentController.getCommentsByParentId));

module.exports = router;
