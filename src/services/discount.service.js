const { convertToObjectIdMongodb } = require("../utils/index");
const discountModel = require("../models/discount.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const ProductDBInteractionLayer = require("../models/repositories/product.repo");
const DiscountDBInteractionLayer = require("../models/repositories/discount.repo");

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user,
      users_used,
    } = payload;
    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError("Invalid date time");
    }
    const foundDiscount = await discountModel.findOne({
      discount_code: code,
      discount_shopId: shopId,
    });
    if (foundDiscount) {
      throw new BadRequestError("Discount code exist in this shop");
    }
    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value,
      discount_shopId: shopId,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: product_ids,
    });
    return newDiscount;
  }

  static async updateDiscountCode() {}

  /**
   *
   * @returns list of product which can use a specific discount
   */

  static async getAllProductAppliedByDiscount({
    code,
    shopId,
    userId,
    limit = 50,
    page = 1,
  }) {
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: shopId,
      })
      .lean();
    if (!foundDiscount) {
      throw new BadRequestError("Discount code exist in this shop");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;

    let products;
    if (discount_applies_to == "all") {
      products = await ProductDBInteractionLayer.findAllProducts({
        page,
        limit,
        sort: "ctime",
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        select: ["product_name"],
      });
    } else {
      const objectIdArray = discount_product_ids.map((id) =>
        convertToObjectIdMongodb(id)
      );
      products = await ProductDBInteractionLayer.findAllProducts({
        page,
        limit,
        sort: "ctime",
        filter: {
          _id: { $in: objectIdArray },
        },
        select: ["product_name"],
      });
    }

    return products;
  }

  /**
   *
   * @returns list of discount of a specific shop
   */
  static async getAllDiscountCodesByShop({ limit = 50, page = 1, shopId }) {
    const unSelect = { __v: 0, discount_shopId: 0 };
    const discounts =
      await DiscountDBInteractionLayer.findAllCDiscountCodesByQuery({
        limit,
        page,
        filter: {
          discount_shopId: convertToObjectIdMongodb(shopId),
          discount_is_active: true,
        },
        select: unSelect,
      });
    return discounts;
  }

  /**
   *
   *
   * @returns the discount price and total price that user need to pay
   * @attention this function didn't check if the codeId is valid with the product
   */

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    //check if the discount code is valid first
    const foundDiscount = await discountModel.findOne({
      discount_code: codeId,
      discount_shopId: shopId,
    });
    if (!foundDiscount) {
      throw new BadRequestError("Discount code exist in this shop");
    }
    const {
      discount_is_active,
      discount_max_uses,
      discount_end_date,
      discount_start_date,
      discount_min_order_value,
      discount_type,
      discount_users_used,
      discount_value,
      discount_max_uses_per_user,
    } = foundDiscount;
    if (!discount_is_active) throw new NotFoundError("discount doesnt exist");
    if (!discount_max_uses) throw new NotFoundError("discount is out");
    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new NotFoundError("discount code expire");
    }

    //check if the cart meets the minimun standard to use discount
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);
      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `discount requires a minimun order value of ${discount_min_order_value}`
        );
      }
    }
    // check how many times a user can use this code again
    if (discount_max_uses_per_user > 0) {
      const userDiscount = discount_users_used.find(
        (user) => user.userId == userId
      );
      if (userDiscount) {
        ///...
      }
    }

    // Calculating the discount value
    const amount =
      discount_type == "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  /**
   *
   * used for shop admin
   */
  static async deleteDiscountCode() {
    // cách tiếp cận nay xóa bay trong db => khá đơn giản
    // thường là nên check có user nào apply code trong hệ thống,... chưa rồi mới xóa
    const deletedCode = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    });
    return deletedCode;
  }

  /**
   *
   *
   * User decide to cancel discount voucher
   */

  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await discountModel.findOne({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    });
    if (!foundDiscount) {
      throw new BadRequestError("Discount code exist in this shop");
    }
    const result = await discountModel.findByIdAndUpdate(codeId, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });
    return result;
  }
}

module.exports = DiscountService;
