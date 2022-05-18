var mongoose = require ('mongoose') ;

let userSchema = mongoose.Schema({
  name:{type:String},
  email: {type:String},
  password: {type:String},
  qrcodes:[{type:String}]
})


module.exports = mongoose.model('users',userSchema)