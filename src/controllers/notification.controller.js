const { CREATED, OK } = require("../core/success.response");
const NotificationService = require("../services/notification.service");

class NotificationController {

  listNotiByUser = async (req, res, next) => {
    new OK({
      message: "get notification by user",
      metadata: await NotificationService.listNotiByUser(req.query),
    }).send(res);
  };
}

module.exports = new NotificationController();
