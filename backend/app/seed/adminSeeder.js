const bcrypt = require('bcryptjs')

const {default : chalk} = require('chalk')
const User = require('../models/users.model')

const seedAdmin = async()=>{
    try{
        const adminExists = await User.findOne({
            role: "admin"
        })

        if(adminExists){
            console.log(chalk.blue("Admin already exists"))
            return
        }

        const hasedPassword = await bcrypt.hash("Admin@123", 10)

        await User.create({
            name:"Super Admin",
            email:"admin@gmail.com",
            phone:"9999999999",
            password:hasedPassword,
            role:"admin",
            isFirstLogin:false,
            status:true,
            department:"Admin",
            isVerified: true
        })

        console.log(chalk.bgBlueBright("Admin created successfully"))
    }
    catch(error){
        console.log(error)
    }
}

module.exports = seedAdmin