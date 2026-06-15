

module.exports=(socket,io)=>{

      console.log("User connected",socket.user.id);

    socket.on("join-room",(roomName)=>{
     socket.join(roomName)
    })

    socket.on("personal-message", ({message,roomName}) => {
        console.log("user",socket.user.name,"said",message);

        io.emit("personal-message", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

}

