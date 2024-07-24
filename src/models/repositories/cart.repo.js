const cartModel = require("../cart.model");
const { convertToObjectIdMongodb } = require("../../utils/index.js");
class CartDBInteractionLayer {
  static async findCartById(cartId) {
    return await cartModel.findOne({
      _id: convertToObjectIdMongodb(cartId),
      cart_state: "active",
    });
  }
}

module.exports = CartDBInteractionLayer;
