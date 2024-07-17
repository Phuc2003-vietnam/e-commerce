//use factory pattern
const {
  productModel,
  electronicModel,
  clothingModel,
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const { createProductInTransistion } = require("../utils/database");
//define factory
class Factory {
  static async createProduct(type, payload) {
    switch (type) {
      case "Clothing":
        return await new Clothing(payload).createProduct();
      case "Electronics":
        return await new Electronics(payload).createProduct();
      default:
        throw new BadRequestError(`Invalid product type: ${type}`);
    }
  }
}
//define classes
class Product {
  constructor(payload) {
    this.product_name = payload.product_name;
    this.product_thumb = payload.product_thumb;
    this.product_description = payload.product_description;
    this.product_price = payload.product_price;
    this.product_quantity = payload.product_quantity;
    this.product_type = payload.product_type;
    this.product_shop = payload.product_shop;
  }
  async createProduct() {
    return await productModel.create(this);
  }

  async createProductWithSession(session) {
    // console.log("in parents: ",this);
    return await productModel.create([this], { session });
  }
}

class Clothing extends Product {
  constructor(payload) {
    super(payload);
    this.product_attributes = payload.product_attributes;
  }
  async createProduct() {
    return await createProductInTransistion(
      this,
      clothingModel
    );
  }
}

class Electronics extends Product {
  constructor(payload) {
    super(payload);
    this.product_attributes = payload.product_attributes;
  }
  async createProduct() {
    return await createProductInTransistion(
      this,
      electronicModel
    );
  }
}

module.exports = Factory;
