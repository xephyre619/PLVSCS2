const mongoose = require('mongoose') ;

let eventSchema = mongoose.Schema({
  
  eventName:{type:String},
  eventHours:{type:Number},
  eventStartDate:{type:String},
  eventEndDate:{type:String},
  eventNoOfStudent:{type:String},
  eventVenue:{type:String},
  eventNeededMaterial:{type:String},
  studentParticipating:[{type:mongoose.Schema.Types.ObjectId,ref:'student'}],
  studentParticipatingAndHoursRendered:[{type:mongoose.Schema.Types.ObjectId,ref:'participatindAndRHour'}],
  listofStudentWishingToParticipate :[{type:mongoose.Schema.Types.ObjectId,ref:'student'}],
  eventStatus:{type:Boolean,default:false},
  scannedImage:{type:String},
  dateAndTime: {type:String}
  
  
  

})

module.exports = mongoose.model('events',eventSchema) ;

