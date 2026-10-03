const mongoose = require('mongoose')


const connectDB = async()=>{
    try{
        const connection = await mongoose.connect(process.env.MONGODB_URL)

        if(connection){
            console.log("MongoDB connected successfully!")
        }
        else{
            console.log("Unable to connect MongoDB")
        }
    }

    catch(err){
        console.log(err.message)
    }
}

module.exports = connectDB