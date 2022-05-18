const mongoose = require('mongoose') ;

let adminSchema = mongoose.Schema({
  idNo:{type:String,unique:true},
  email:{type:String},
  surname:{type:String},
  contactNo:{type:String},
  firstName:{type:String},
  middleName:{type:String},
  username:{type:String},
  departmentCode:{type:String},
  department:{type:String},
  password:{type:String},
  adminType:{type:String},
  listOfCreatedActivities:[{type:mongoose.Schema.Types.ObjectId,ref:"activities"}],
  listOfCreatedEvents:[{type:mongoose.Schema.Types.ObjectId,ref:"events"}],
  
  
})

module.exports = mongoose.model('admin',adminSchema) ;


