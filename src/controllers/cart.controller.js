const { CREATED, OK } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  addToCart = async (req, res, next) => {
    new OK({
      message: "Add a product to cart success",
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  };

  updateCart = async (req, res, next) => {
    new OK({
      message: "Update product in cart success",
      metadata: await CartService.addToCartV2(req.body),
    }).send(res);
  };

  deleteProductInCart = async (req, res, next) => {
    new OK({
      message: "Delete product in cart success",
      metadata: await CartService.deleteUserCart(req.body),
    }).send(res);
  };

  getUserCart = async (req, res, next) => {
    new OK({
      message: "Get the cart success",
      metadata: await CartService.getUserCart(req.query),
    }).send(res);
  };
}

module.exports = new CartController();
