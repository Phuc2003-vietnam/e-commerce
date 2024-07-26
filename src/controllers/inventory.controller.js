const { CREATED, OK } = require("../core/success.response");
const InventoryService = require("../services/inventory.service");

class InventoryController {
  addStock = async (req, res, next) => {
    new OK({
      message: "Add new stock success",
      metadata: await InventoryService.addStockToInventory(req.body),
    }).send(res);
  };
}

module.exports = new InventoryController();
