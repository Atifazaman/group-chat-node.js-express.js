const userTable=require("../models/userModel")
const jwt=require("jsonwebtoken")
module.exports=(io)=>{
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
}