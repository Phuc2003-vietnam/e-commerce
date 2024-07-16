const app = require("./src/app");
const PORT=process.env.PORT || 8080
const server=app.listen(8080,()=>{
    console.log(`Server listen on port: ${PORT}`);
})
process.on('SIGINT',async  ()=>{
    server.close(()=>{console.log("EXIT SERVER ");})
})