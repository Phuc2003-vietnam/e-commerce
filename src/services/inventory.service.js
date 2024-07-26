const { BadRequestError } = require("../core/error.response")
const ProductDBInteractionLayer=require("../models/repositories/product.repo")
// const InventoryDBInteractionLayer=require("../models/repositories/inventory.repo")
const inventoryModel=require("../models/inventory.model")

class InventoryService{
    static async addStockToInventory({stock,productId,shopId,location="HCM"}){
        const product=await ProductDBInteractionLayer.getProductById(productId)
        if(!product) throw new BadRequestError("the product not exist")
        const filter={
            inven_shopId:shopId,
            inven_productId:productId
        }
        const update={
            $inc:{
                inven_stock=+stock
            },
            $set:{
                inven_location:location
            }
        }
        const options={
            upsert:true,
            new:true
        }
        return await inventoryModel.findOneAndUpdate(filter,update,options)
    }
}