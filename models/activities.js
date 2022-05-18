const mongoose = require('mongoose') ;

let activitySchema = mongoose.Schema({
  activityName:{type:String},
  activityHours:{type:Number},
  activityNoOfStudent:{type:Number},
  activityParticipating:[{type:mongoose.Schema.Types.ObjectId,ref:'student'}]
  

})

module.exports = mongoose.model('activities',activitySchema) ;

