const { Server } = require("socket.io");
const socketAuth=require("./middleware")
const chatHandler=require("./handlers/chat")
const personalChatHandler=require("./handlers/personalChat")
const groupChatHandler=require("./handlers/groupChat")

module.exports=(server)=>{
    const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

socketAuth(io)

io.on("connection", (socket) => {
  chatHandler(socket,io)

  personalChatHandler(socket,io)

  groupChatHandler(socket,io)
});

}
