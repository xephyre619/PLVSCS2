const mongoose = require("mongoose") ;

let participatingAndRenderedHoursSchema = mongoose.Schema({
  studentId:{type:mongoose.Schema.Types.ObjectId,ref:"student"},
  eventId:{type:mongoose.Schema.Types.ObjectId,ref:"events"},
  renderedHours:{type:Number,default:0}
  
})

module.exports = mongoose.model("participatindAndRHour",participatingAndRenderedHoursSchema) ;