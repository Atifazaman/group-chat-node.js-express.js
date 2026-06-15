

module.exports=(socket,io)=>{

      console.log("User connected",socket.user.id);

    socket.on("message", (message) => {
        console.log("user",socket.user.name,"said",message);

        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

}

