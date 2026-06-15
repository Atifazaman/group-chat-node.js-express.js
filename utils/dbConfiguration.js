const { Sequelize } = require("sequelize");

const sequelize=new Sequelize(process.env.DB_NAME,process.env.DB_ROOT,process.env.DB_PASS,{
    dialect:"mysql",
    host:process.env.DB_HOST
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