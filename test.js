// main.js

const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  // Fork workers
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
} else {
  // This code will run in each worker process

  const express = require('express');
  const mongoose = require('mongoose');
  require('dotenv').config();

  const app = express();

  // MongoDB connection
  mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true });

  // Define your routes and other middleware here

  const PORT = process.env.PORT || 3000;
 app.get("/",(req,res)=>{
    console.log("Number of connection: ",mongoose.connection.base.connections.length);
 })
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in process ${process.pid}`);
  });
}
