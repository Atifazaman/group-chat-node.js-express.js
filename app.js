const express=require("express")
const app=express()
const cors=require("cors")

const db=require("./utils/dbConfiguration")
require("./models/associations");

const userRouter=require("./routes/userRouter")
const chatRouter=require("./routes/chatRouter")

app.use(cors())
app.use(express.static("public"))
app.use(express.json())


app.use("/user",userRouter)
app.use("/chat",chatRouter)

db.sync({force:false}).then(()=>{
app.listen(3000,()=>{
    console.log("Server is running")
})
}).catch((err)=>{
    console.log(err)
})
