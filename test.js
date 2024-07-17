// class ServiceLogistics {
//   constructor({ name, doors, price }) {
//     console.log("daddy");
//     this.name = name;
//     this.doors = doors;
//     this.price = price;
//   }

//   // Factory Method
//   static createTransport(type, info) {
//     if (type === "car") {
//       return new Car(info);
//     } else if (type === "truck") {
//       return new Truck(info);
//     } else {
//       throw new Error("Unknown transport type");
//     }
//   }
// }

// class Car extends ServiceLogistics {
//   sound() {
//     return "car car car";
//   }
// }

// class Truck extends ServiceLogistics {
//   constructor(){

//     console.log("sugar");
//   }
//   sound() {
//     return console.log(this);
//   }
// }

// // Client code

// const ins = new Truck({ name: "phuc" });
// console.log(ins.sound());
