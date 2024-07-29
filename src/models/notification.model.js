const { Schema, mongoose } = require("mongoose");

const DOCUMENT_NAME = "Notification";
const COLLECTION_NAME = "Notifications";

/*
ORDER-001: order successfully,
ORDER-002: order fail,
PROMOTION-001: new promotion,
SHOP-001: sgop create new product by user following
 */
const notificationSchema = new mongoose.Schema(
  {
    noti_type:{type:String,enum:['ORDER-001','ORDER-002','PROMOTION-001','SHOP-001'],require:true},
    noti_senderId:{type:Number,required:true},
    noti_receiverId:{type:Number,required:true},
    noti_content:{type:String,required:true},
    noti_options:{type:Object,default:{}}
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, notificationSchema);
