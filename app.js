const http = require("http");
const { Server } = require("socket.io");
const express=require("express")
const app=express()
const cors=require("cors")
require("dotenv").config()
const jwt = require("jsonwebtoken");
const userTable = require("./models/userModel");
const socketIO=require("./socket_io")

const db=require("./utils/dbConfiguration")
require("./models/associations");

require("./cronJobs/chatArchive");
require("./cronJobs/groupMessageArchive");
require("./cronJobs/personalMessageArchive");

const userRouter=require("./routes/userRouter")
const chatRouter=require("./routes/chatRouter")
const mediaRoute =require("./routes/mediaRoute");

const errorMiddleware=require("./middleware/errorHandler")

app.use(cors())
app.use(express.static("public"))
app.use(express.json())


app.use("/user",userRouter)
app.use("/chat",chatRouter)
app.use("/media",mediaRoute);

app.use(errorMiddleware)


const server = http.createServer(app);


const io=socketIO(server)


db.sync({force:false}).then(()=>{
server.listen(process.env.PORT,()=>{
    console.log("Server is running")
})
}).catch((err)=>{
    console.log(err)
})
