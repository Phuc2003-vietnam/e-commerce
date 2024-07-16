const mongoose = require("mongoose");
require('dotenv').config()


async function connect() {
    try {
        // mongoose.set('strictQuery', false);
        // mongoose.set('debug',true)
        // mongoose.set('debug',{color:true})
        console.log(mongoose.connection.readyState);
        mongoose.connect(process.env.MONGO_DB);
        console.log(mongoose.connection.readyState);
        console.log("connect successfuly");
        
    }
    catch(error){
        console.log("connect failure2");
    }
}
async function countConnect() {
    try {
       console.log("Number of connection: ",mongoose.connections.length);
        
    }
    catch(error){
        console.log("connect failure2");
    }
}


module.exports= {connect,countConnect}
