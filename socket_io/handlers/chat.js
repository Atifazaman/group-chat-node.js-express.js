module.exports = (socket, io) => {

    console.log("User connected", socket.user.id);


    socket.on("message", (data) => {

        console.log(
            "user",
            socket.user.name,
            "said",
            data.message
        );


        io.emit("message", {

            userId: socket.user.id,

            senderName: socket.user.name,

            message: data.message,
                fileUrl: data.fileUrl,

            fileType: data.fileType,

            createdAt: new Date()

        });

    });


    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

};

