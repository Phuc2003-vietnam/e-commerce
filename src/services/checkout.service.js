const CartDBInteractionLayer = require("../models/repositories/cart.repo");
const { BadRequestError } = require("../core/error.response");
const DiscountService = require("./discount.service");
const ProductDBInteractionLayer = require("../models/repositories/product.repo");
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
        shopId
      } = shop_order_ids[i];
      const productsInformation = await ProductDBInteractionLayer.getProducts(
        item_products
      );
      console.log(`productsInformation:::`, productsInformation);
      if (!productsInformation[0]) throw new BadRequestError("Order wrong");

      const checkoutPrice = productsInformation.reduce((acc, product) => {
        return acc + product.price * product.quantity;
      },0);

      checkout_order.totalPrice += checkoutPrice;
      const itemCheckOut = {
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
          itemCheckOut.priceApplyDiscount = checkoutPrice - discount;
        }
        checkout_order.totalDiscount += discount;
      }
      checkout_order.totalCheckout += itemCheckOut.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckOut);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }
}
module.exports = CheckoutService;
