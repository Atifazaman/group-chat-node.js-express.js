const { Sequelize } = require("sequelize");

const sequelize=new Sequelize("group_chat","root","aaaa",{
    dialect:"mysql",
    host:"localhost"
});

(async()=>{
    try {
      await sequelize.authenticate()
      console.log("Db connected to sequelize")
    } catch (error) {
        console.log(error)
    }
})()


module.exports=sequelize