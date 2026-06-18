const GroupMessage = require("../../models/groupMessageModel");

module.exports = (socket, io) => {

    console.log("Group socket ready:", socket.user.id);


    // Join group room
    socket.on("join-group", (groupId) => {

        const roomName = `group_${groupId}`;

        socket.join(roomName);

        console.log(
            `${socket.user.name} joined ${roomName}`
        );
    });


    // Send group message
    socket.on("group-message", async ({ groupId, message }) => {

        try {

            // Save message in database
            const savedMessage = await GroupMessage.create({

                groupId,
                userId: socket.user.id,
                message

            });


            // Broadcast to group members
            io.to(`group_${groupId}`).emit(
                "group-message",
                {
                    id: savedMessage.id,
                    groupId,
                    senderId: socket.user.id,
                    senderName: socket.user.name,
                    message,
                    createdAt: savedMessage.createdAt
                }
            );


        } catch(err) {

            console.log(err);

        }

    });


    socket.on("disconnect", () => {

        console.log("User disconnected");

    });

};