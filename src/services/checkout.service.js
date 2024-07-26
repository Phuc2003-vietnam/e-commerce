const CartDBInteractionLayer = require("../models/repositories/cart.repo");
const { BadRequestError } = require("../core/error.response");
const DiscountService = require("./discount.service");
const ProductDBInteractionLayer = require("../models/repositories/product.repo");
const { acquireLock, releaseLock } = require("./redis.service");
const orderModel = require("../models/order.model");
class CheckoutService {
  /*
        {
            cartId,
            userId,
            shop_order_ids:[{
                shopId,
                shop_discount:[{
                    shopId,
                    discountOd,
                    codeId
                }],
                item_products:[{
                    {
                        price,
                        quantity,
                        productId
                    }
                }]
            },]
        }
     */
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    //ATTENTION: some of the logic is not realy secure, some is wrong => this function is to check fast, dont need to care much
    //didnt check if discoundId can be applied to a specific product
    const foundCart = await CartDBInteractionLayer.findCartById(cartId);
    if (!foundCart) throw new BadRequestError("Cart does not exists");

    let checkout_order = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalCheckout: 0,
    };
    let shop_order_ids_new = [];

    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shop_discounts = [],
        item_products = [],
        shopId,
      } = shop_order_ids[i];
      // A shop order can have many item_products like user buy item B, C in shop A
      const productsInformation = await ProductDBInteractionLayer.getProducts(
        item_products
      );
      if (!productsInformation[0]) throw new BadRequestError("Order wrong");

      const checkoutPrice = productsInformation.reduce((acc, product) => {
        return acc + product.price * product.quantity;
      }, 0);

      checkout_order.totalPrice += checkoutPrice;
      const shopCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: productsInformation,
      };
      //check  discount
      if (shop_discounts.length > 0) {
        //Example: only 1 discount code
        const { totalPrice = 0, discount = 0 } =
          await DiscountService.getDiscountAmount({
            codeId: shop_discounts[0].codeId,
            userId,
            shopId,
            products: productsInformation,
          });
        if (discount > 0) {
          shopCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
        checkout_order.totalDiscount += discount;
      }
      checkout_order.totalCheckout += shopCheckout.priceApplyDiscount;
      shop_order_ids_new.push(shopCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  //Create an order and minus stock in inventory if sufficient
  static async orderByUser({
    cartId,
    userId,
    shop_order_ids,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } = await this.checkoutReview({
      cartId,
      userId,
      shop_order_ids,
    });
    //check whether products'quantity is still available in inventories
    const all_shops_items = shop_order_ids_new.flatMap(
      (shopCheckout) => shopCheckout.item_products
    ); //=> all_shops_items=[{price,quantity,productId},:.]
    const acquireProduct = [];
    for (let i = 0; i < all_shops_items.length; i++) {
      const { productId, quantity } = all_shops_items[i];
      const keyLock = await acquireLock(productId, quantiy, cartId);
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }
    //check whether some products is not sufficient
    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        "Only some products are updated, some dont have enough stock in inventory "
      );
    }

    const newOrder = await orderModel.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });

    return newOrder;
  }
  static async getOrdersByUser(){

  }
  static async getOneOrderByUser(){

  }
  static async cancelOrderByUser(){

  }
  static async updateOrderStatusByShop(){}
  //hệ th[ng update phải tự động khi đưa tới nhà vận chuyển 
}
module.exports = CheckoutService;
