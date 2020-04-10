const mongo = require('mongoose')

const authorSchema = new mongo.Schema({
    name:{
        type:String,
        required:true
    }

})

module.exports = mongo.model('Author' , authorSchema)