const jwt=require("jsonwebtoken")
const userTable=require("../models/userModel")

const auth=async(req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1]

        if(!token){
            const error=new Error("No Token!!")
            error.statusCode=401
            return next(error)
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await userTable.findByPk(decoded.id)

        req.user=user

        next()
    } catch (error) {
        error.statusCode=401
        next(error)
    }
}

module.exports=auth