const notiificationModel = require("../models/notification.model");
const { convertToObjectIdMongodb } = require("../utils/index");
const { BadRequestError } = require("../core/error.response");
class NotificaitonService {
  static async pushNotiToSystem({
    type = "SHOP-001",
    receiverId = 1,
    senderId = 1,
    options = {},
  }) {
    let noti_content = "";
    if (type == "SHOP-001") {
      noti_content = `@ vừa mới thêm 1 sp mới @`;
    } else if (type == "PROMOTION-001") {
      noti_content = `@ vừa mới thêm 1 voucher mới @`;
    }
    const newNoti = await notiificationModel.create({
      noti_type: type,
      noti_senderId: senderId,
      noti_receiverId: receiverId,
      noti_content,
      noti_options: options,
    });
    return newNoti;
  }

  //Aggregate??
  static async listNotiByUser({ userId = 1, type = "ALL", isRead = 0 }) {
    const match = { noti_receiverId: userId };
    if (type != "ALL") {
      match[noti_type] = type;
    }
    return await notiificationModel.aggregate([
      { $match: match },
      {
        $project: {
          noti_type: 1,
          noti_senderId: 1,
          noti_receiverId: 1,
          createdAt: 1,
          noti_options:1
        },
      },
    ]);
  }
}
module.exports = NotificaitonService;
