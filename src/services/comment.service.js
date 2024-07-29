const commentModel = require("../models/comment.model");
const { convertToObjectIdMongodb } = require("../utils/index");
const { BadRequestError } = require("../core/error.response");
const ProductDBInteractionLayer = require("../models/repositories/product.repo");
class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null,
  }) {
    const newComment = new commentModel({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
    });
    let rightValue = 0;
    if (parentCommentId) {
      const parentComment = await commentModel.findById(parentCommentId);
      if (!parentComment) throw new BadRequestError("Not found parent comment");
      rightValue = parentComment.comment_right;

      await commentModel.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_right: { $gte: rightValue },
        },
        {
          $inc: { comment_right: 2 },
        }
      );

      await commentModel.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: { $gt: rightValue },
        },
        {
          $inc: { comment_left: 2 },
        }
      );
    } else {
      const maxRight = await commentModel.findOne(
        {
          comment_productId: convertToObjectIdMongodb(productId),
        },
        "comment_right",
        { sort: { comment_right: -1 } }
      );
      if (maxRight) {
        rightValue = maxRight.comment_right + 1;
      } else {
        rightValue = 1;
      }
    }
    newComment.comment_left = rightValue;
    newComment.comment_right = rightValue + 1;
    await newComment.save();
    return newComment;
  }

  static async getCommentsByParentId({
    productId,
    parentCommentId,
    limit = 50,
    skip = 0,
  }) {
    if (parentCommentId) {
      const parentComment = await commentModel.findById(parentCommentId);
      if (!parentComment) throw new BadRequestError("Not found parent comment");

      const comments = await commentModel.find(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: { $gt: parentComment.comment_left },
          comment_right: { $lt: parentComment.comment_right },
        },
        [
          "comment_left",
          "comment_right",
          "comment_content",
          "comment_parentId",
        ],
        { sort: { comment_left: 1 } }
      );
    } else {
      //query on root comment
      const comments = await commentModel.find(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_parentId: null,
        },
        [
          "comment_left",
          "comment_right",
          "comment_content",
          "comment_parentId",
        ],
        { sort: { comment_left: 1 } }
      );
    }
    return comments;
  }

  static async deleteComment({ commentId, productId }) {
    const comment = await commentModel.findById(commentId).lean();
    if (!comment) throw new BadRequestError("Not found comment");

    const foundProduct = await ProductDBInteractionLayer.findProduct({
      product_id: productId,
    });
    if (!foundProduct) throw new BadRequestError("Not found Product");

    const leftValue = comment.comment_left;
    const rightValue = comment.comment_right;
    const width = rightValue - leftValue + 1;

    await commentModel.deleteMany({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_left: { $gte: leftValue },
      comment_right: { $lte: rightValue },
    });

    await commentModel.updateMany(
      { comment_right: { $gt: rightValue } },
      { $inc: { comment_right: -width } }
    );

    await commentModel.updateMany(
      { comment_left: { $gt: rightValue } },
      { $inc: { comment_left: -width } }
    );
  }
}
module.exports = CommentService;
