const compression = require('compression')
const express = require('express')
const db = require("./configs/mongoDB.js");
const { default: helmet } = require('helmet')
const morgan = require("morgan")
const mongoose = require("mongoose");
const app= express()
const user= require("./models/shop.model.js")
require('dotenv').config()
// init middleware
app.use(morgan('combined'))
app.use(helmet())
app.use(compression()) 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// init db
db.connect();

// init routes

app.use("",require("./routes"))

//handle errors

app.use((req,res,next)=>{
    const error= new Error("Not found")
    error.status=404
    next(error)
})

app.use((err,req,res,next)=>{
    console.log("error middleware");
    // res.json
    return res.json({
        status:"error",
        message:err.message,
        stack:err.stack,   //only used for dev
        code:err.status||500
    })
})

// app.get("/", async function (req, res) {
//   try {
//     console.log(db.countConnect());
//     res.status(200).json({ message: "OK" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// //Create a user
// app.post("/user", async function (req, res) {
//   try {
//     console.log("hi");
//     const { email, password, name, age, address, crush } = req.body;
//     await user.create({ email, password, name, age, address, crush });
//     console.log("hello");
//     res.status(200).json({ message: "User Created Successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// //get users  = Read users
// app.get("/users", async function (req, res) {
//   try {
//     console.log("The number of connection: " ,  mongoose.connections.length);
//     for(var i=0;i<10000;i++)
//     {
      
//     }
//     const { _id, email, name, age, address } = req.query;

//     let query = {};
//     // if(_id) query._id=_id
//     if (email) query.email = email;
//     if (name) query.name = name;
//     if (age) query.age = age;
//     if (address) query.address = address;

//     console.log(query);
//     const userData = await user.find(query);
//     // const userData= await user.findById(query);   // Get user by id
//     // const userData= await user.findOne(query);  // Get only 1 user

//     return res.status(200).json(userData);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// //Update User
// app.put("/user", async function (req, res) {
//   try {
//     const { _id, email, name, age, address } = req.body;

//     let query = {};
//     if (name) query.name = name;
//     if (age) query.age = age;
//     if (address) query.address = address;

//     console.log(query);
//     const userData = await user.updateOne({ email }, query);
//     // const userData= await user.findOneAndUpdate({email},query,{returnDocument:"after"});
//     // const userData= await user.updateOne({_id},query);

//     return res.status(200).json(userData);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// //Update many users
// app.put("/users", async function (req, res) {
//   try {
//     const { name } = req.body;
//     const userData = await user.updateMany(
//       { name },
//       { name: name.toUpperCase() }
//     );
//     return res.status(200).json(userData);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// //Delete a user
// app.delete("/user", async function (req, res) {
//   try {
//     const { email } = req.body;
//     await user.deleteOne({ email: email });
//     res.status(200).json({ message: "User Deleted Successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// //Delete many user
// app.delete("/users", async function (req, res) {
//   try {
//     const { name } = req.body;
//     user.deleteMany({ name });
//     res.status(200).json({ message: "Users Deleted Successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// app.get("/",(req,res)=>{
//     return res.status(500).json({message:"OK", metadata: str.repeat(10000)})
// })
module.exports=app