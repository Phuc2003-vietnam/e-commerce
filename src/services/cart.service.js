//chưa có cart thì tạo mới, nếu có rồi thì thêm số lượng sp đố trong cart
const { NotFoundError } = require("../core/error.response");
const cartModel = require("../models/cart.model");
const ProductDBInteractionLayer = require("../models/repositories/product.repo");
class CartService {
  // in this cart , we dont update the quantity in productModel , only interact with cartModel =>not tracking user behavior
  static async createUserCart({ userId, product }) {
    const filter = {
      cart_state: "active",
      cart_userId: userId,
    };
    const update = {
      $addToSet: {
        cart_products: product,
      },
      $inc: {
        cart_count_product: 1,
      },
    };
    const options = {
      new: true,
      upsert: true,
    };
    return await cartModel.findOneAndUpdate(filter, update, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const filter = {
      cart_userId: userId,
      "cart_products.productId": productId,
      cart_state: "active",
    };
    const update = {
      $inc: {
        "cart_products.$.quantity": quantity,
      },
    };
    const options = {
      new: true,
      upsert: true,
    };
    return await cartModel.findOneAndUpdate(filter, update, options);
  }

  static async addToCart({ userId, product = {} }) {
    const userCart = await cartModel.findOne({ cart_userId: userId });
    //cart not exist
    if (!userCart) {
      return await this.createUserCart({ userId, product });
    }
    //empty cart
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      userCart.cart_count_product = 1;
      return await userCart.save();
    }
    //the cart is notempty
    return await this.updateUserCartQuantity({ userId, product });
  }

  static async addToCartV2({ userId, shop_order_list }) {
    const { productId, quantity, old_quantity } =
      shop_order_list[0]?.item_products[0];
    const foundProduct = await ProductDBInteractionLayer.findProduct({
      product_id: productId,
    });
    if (!foundProduct) throw new NotFoundError();
    if (foundProduct.product_shop.toString() !== shop_order_list[0]?.shopId) {
      throw new NotFoundError("Product do not belong to this shop");
    }
    return await this.updateUserCartQuantity({
      userId,
      product: { productId, quantity: quantity - old_quantity },
    });
  }

  /**
   *
   * @desc  ot actually delete the cart but remove the product from carts
   */
  static async deleteUserCart({ userId, productId }) {
    const query = {
      cart_userId: userId,
      cart_state: "active",
      "cart_products.productId": productId,
    };

    const update = {
      $pull: {
        cart_products: {
          productId,
        },
      },
      $inc: {
        cart_count_product: -1, // Decrease by one because one product is removed
      },
    };
    const options = {
      new: true,
    };
    return await cartModel.findOneAndUpdate(query, update, options);
  }

  static async getUserCart({ userId }) {
    return await cartModel.findOne({
      cart_userId: userId,
    });
  }
}

module.exports = CartService;
