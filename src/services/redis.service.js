// const redis = require("redis");
// const { promisify } = require("util");
// const redisClient = redis.createClient();
// const pexpire = promisify(redisClient.pexpire).bind(redisClient);
// const setnxAsync = promisify(redisClient.setnx).bind(redisClient);
// const InventoryDBInteractionLayer = require("../models/repositories/inventory.repo");
// //working like mutex lock, we are using OPTIMISTIC lock
// const acquireLock = async (productId, quantity, cardId) => {
//   const key = `lock_v2023_${productId}`;
//   const retryTimes = 10;
//   const expireTime = 3000;

//   for (let i = 0; i < retryTimes.length; i++) {
//     const res = await setnxAsync(key, expireTime); // res==1 means you can access resouce
//     console.log(res);
//     if (result == 1) {
//       //do logic
//       const isReservation =
//         await InventoryDBInteractionLayer.reservationInventory({
//           productId,
//           quantity,
//           cartId,
//         });
//       if(isReservation.modifiedCount){
//         await pexpire(key,expireTime)  //unlock mutex in expireTime so other can access
//         return key
//       }
//       return null // meaning cant chang the inven_stock as  invenstock < requested quantity
//     } else {
//       await new Promise((resolve) => setTimeout(resolve, 50)); //wait 50ms before try again for one is locked
//     }
//   }
// };

// const releaseLock = async (keyLock) => {
//   const delAsyncKey = promisify(redisClient.del).bind(redisClient);
//   return await delAsyncKey(keyLock);
// };

// module.exports = {
//   acquireLock,
//   releaseLock,
// };
