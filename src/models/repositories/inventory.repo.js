const inventoryModel = require("../inventory.model.js");
const { Types } = require("mongoose");
const { convertToObjectIdMongodb } = require("../../utils/index");
class InventoryDBInteractionLayer {
  static insertInventory = async ({
    productId,
    shopId,
    stock,
    location = "Unknown",
  }) => {
    return await inventoryModel.create({
      inven_productId: productId,
      inven_shopId: shopId,
      inven_stock: stock,
      inven_location: location,
    });
  };
  static reservationInventory = async ({ productId, cartId, quantity }) => {
    const filter = {
      inven_productId: convertToObjectIdMongodb(productId),
      inven_stock: {
        $gte: quantity,
      },
    };
    const update = {
      $inc: {
        inven_stock: -quantity,
      },
      $push: {
        inven_reservations: {
          productId,
          quantity,
          createdOn: new Date(),
        },
      },
    };
    const option = { new: true };
    return await inventoryModel.updateOne(filter, update, option);
  };
}
module.exports = InventoryDBInteractionLayer;
