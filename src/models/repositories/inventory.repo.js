const inventoryModel = require("../inventory.js");
const { Types } = require("mongoose");


class InventoryDBInteractionLayer {
  static insertInventory = async ({
    productId,
    shopId,
    stock,
    location = "Unknown",
  }) => {
    console.log(productId,shopId,stock);
    return await inventoryModel.create({
      inven_productId: productId,
      inven_shopId: shopId,
      inven_stock: stock,
      inven_location: location,
    });
  };
}
module.exports = InventoryDBInteractionLayer
