const http = require("http");
const { Server } = require("socket.io");
const express=require("express")
const app=express()
const cors=require("cors")
require("dotenv").config()
const jwt = require("jsonwebtoken");
const userTable = require("./models/userModel");

const db=require("./utils/dbConfiguration")
require("./models/associations");

const userRouter=require("./routes/userRouter")
const chatRouter=require("./routes/chatRouter")

const errorMiddleware=require("./middleware/errorHandler")

app.use(cors())
app.use(express.static("public"))
app.use(express.json())


app.use("/user",userRouter)
app.use("/chat",chatRouter)

app.use(errorMiddleware)


const server = http.createServer(app);

// todo : set cross
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// todo socket auth middleware 
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No Token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userTable.findByPk(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;

    next();
  } catch (err) {
    console.log("Socket Auth Error:", err.message);
    next(err);
  }
});


io.on("connection", (socket) => {
    console.log("User connected",socket.id);

    socket.on("message", (message) => {
        console.log("user",socket.user.name,"said",message);

        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});


db.sync({force:false}).then(()=>{
server.listen(process.env.PORT,()=>{
    console.log("Server is running")
})
}).catch((err)=>{
    console.log(err)
})
