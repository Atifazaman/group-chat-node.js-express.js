const express=require("express")
const app=express()
const cors=require("cors")

const db=require("./utils/dbConfiguration")
const userModel=require("./models/userModel")

const userRouter=require("./routes/userRouter")


app.use(cors())
app.use(express.static("public"))
app.use(express.json())


app.use("/user",userRouter)


db.sync({force:false}).then(()=>{
app.listen(3000,()=>{
    console.log("Server is running")
})
}).catch((err)=>{
    console.log(err)
})
