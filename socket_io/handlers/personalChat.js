module.exports = (socket, io) => {

    console.log("User connected", socket.user.id);

    socket.on("join-room", (roomName) => {
        socket.join(roomName);
        console.log(`${socket.user.name} joined ${roomName}`);
    });

    socket.on("personal-message", ({ message, roomName, fileUrl, fileType}) => {

        io.to(roomName).emit("personal-message", {
            senderId: socket.user.id,
            senderName: socket.user.name,
            message,
             fileUrl,

            fileType,
            createdAt: new Date()
        });

    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

};