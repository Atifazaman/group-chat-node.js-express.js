const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedEmail=email.toLowerCase()

    const existingEmail = await userModel.findOne({ where: { email:normalizedEmail } });

    if (existingEmail) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.create({
      name,
      email:normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User Signed Up Successfully!!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "User Signed Up failed!!" });
  }
};

const login = async (req, res) => {
 try {
   const {email,password}=req.body
   
   const normalizedEmail=email.toLowerCase()
   const user=await userModel.findOne({where:{email:normalizedEmail}})

   if(!user){
    return res.status(404).json({message:"User Not Found"})
   }
   const isMatch=await bcrypt.compare(password,user.password)

   if(!isMatch){
    return res.status(401).json({message:"Email/Password is wrong"})
   }

   res.status(200).json({message:"Login Successful"})
 } catch (error) {
  res.status(500).json({message:"Login Failed"})
  console.log(error)
 }
};

module.exports = {
  signUp,
  login,
};
