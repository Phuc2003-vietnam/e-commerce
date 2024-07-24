const { CREATED, OK } = require("../core/success.response");
const CheckoutService = require("../services/checkout.service");

class CheckoutController {
  checkoutReview = async (req, res, next) => {
    new OK({
      message: "Get checkout information success",
      metadata: await CheckoutService.checkoutReview(req.body),
    }).send(res);
  };
}

module.exports = new CheckoutController();
