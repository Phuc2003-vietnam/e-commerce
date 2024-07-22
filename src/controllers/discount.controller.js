const { CREATED, OK } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  createDsicountCode = async (req, res, next) => {
    new OK({
      message: "Create discount success",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscountCodes = async (req, res, next) => {
    new OK({
      message: "Get all discount code success",
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getDiscountAmount = async (req, res, next) => {
    new OK({
      message: "Get discount amount success",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  };

  getAllProductAppliedByDiscount = async (req, res, next) => {
    new OK({
      message: "Get products that can use this code success",
      metadata: await DiscountService.getAllProductAppliedByDiscount({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  };
}
module.exports = new DiscountController();
