const mongoose = require('mongoose')


const isValid = (id)=>{
    return mongoose.Types.ObjectId.isValid(id)
}

module.exports = {isValid}