const mongoose = require('mongoose')

const connectDB = async() =>{
    console.log("connection")
    try{
        console.log('try')
        const conn = await mongoose.connect(process.env.mongoDb_URl);
        console.log(`Mongo Db connected ${conn.connection.host}`)
        console.log('try done')

    }catch(error){
        console.error(error.message)
    }
}

module.exports = connectDB;