const discountModel = require("../discount.model.js");

class DiscountDBInteractionLayer {
  static findAllCDiscountCodesByQuery = async ({
    limit = 50,
    page = 1,
    sort = "ctime",
    filter,
    select,
  }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort == "ctime" ? { _id: -1 } : { _id: 1 };
    return await discountModel
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(select)
      .lean();
  };
}

module.exports = DiscountDBInteractionLayer;
