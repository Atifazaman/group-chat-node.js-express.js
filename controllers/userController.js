const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userTable = require("../models/userModel");
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existUser = await userTable.findOne({
      where: { email: normalizedEmail },
    });

    if (existUser) {
      const error = new Error("Email already exists!!");
      error.statusCode = 409;
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userTable.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });
    res.status(201).json({ message: "User Account Got Created Successfully" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const userExist = await userTable.findOne({
      where: { email: normalizedEmail },
    });

    if (!userExist) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }

    const isMatch = await bcrypt.compare(password, userExist.password);

    if (!isMatch) {
      const error = new Error("Inavlid email or passwod!!");
      error.statusCode = 401;
      return next(error);
    }

    const token=jwt.sign(
        {
            id:userExist.id,
            email:userExist.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"15m"
        }
    )

    res.status(200).json({
      message: "Login successful",
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
};
