const http = require("http");
const WebSocket = require("ws");
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
const wss = new WebSocket.Server({ server });

let sockets = [];

wss.on("connection", (ws) => {
    console.log("User connected");
    sockets.push(ws);
    ws.on("message", (message) => {
        console.log(message.toString());
        sockets.forEach((s) => {
            if (s.readyState === WebSocket.OPEN) {
                s.send(message.toString());
            }
        });
    });

    ws.on("close", () => {
        console.log("User disconnected");
        sockets = sockets.filter((s) => s !== ws);

    });

});

db.sync({force:false}).then(()=>{
server.listen(3000,()=>{
    console.log("Server is running")
})
}).catch((err)=>{
    console.log(err)
})
