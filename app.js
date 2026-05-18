const http = require("http");
const { Server } = require("socket.io");
const express=require("express")
const app=express()
const cors=require("cors")



const db=require("./utils/dbConfiguration")
require("./models/associations");

const userRouter=require("./routes/userRouter")
const chatRouter=require("./routes/chatRouter")

app.use(cors())
app.use(express.static("public"))
app.use(express.json())


app.use("/user",userRouter)
app.use("/chat",chatRouter)


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});


io.on("connection", (socket) => {
    console.log("User connected",socket.id);

    socket.on("message", (message) => {
        console.log("user",socket.id,"said",message);

        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});


db.sync({force:false}).then(()=>{
server.listen(3000,()=>{
    console.log("Server is running")
})
}).catch((err)=>{
    console.log(err)
})
