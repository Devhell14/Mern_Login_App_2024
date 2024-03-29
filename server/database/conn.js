const mongoose = require('mongoose')

const connectDB = async() =>{
    try{
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGODB_URI)
        
        console.log('Connect DB Success')
    }catch(err){
        console.log(err)
        process.exit(1)
    }
}

module.exports = connectDB;