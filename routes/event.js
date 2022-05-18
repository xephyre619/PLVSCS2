
const express = require('express');
const router = express.Router();
const studentdb = require('../models/student');
const eventAndRenderedHoursdb = require('../models/studentParticipatingAndRenderedHours');
const mongoose = require('mongoose');

const eventdb = require('../models/event');

var base64ToImage = require('base64-to-image');

const multer = require('multer');




var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({
  storage: storage
})





router.get('/', async (req, res) => {
  console.log("/events ....,..***********")

  sqldb = req.con


  sqldb.query('select * from event  where eventStatus = true and isEventDone = 0  ', (err, result) => {

    if (err) {
      console.log(err)
    }
    console.log(result)
    console.log("events..." + JSON.stringify(result))
    res.send(result)
  })


  /*
  let events = await eventdb.find({eventStatus:true}).populate('studentParticipating').sort({created_at: 1}).populate('studentParticipating').exec()
   ;
  */


})




router.get('/event_all', async (req, res) => {
  //console.log("/events ....,..***********")

  sqldb = req.con


  sqldb.query('select * from event where eventStatus = true  ', (err, result) => {

    if (err) {
      console.log(err)
    }
    console.log(result)
    console.log("events..." + result)
    res.send(result)
  })




})







router.get('/markAttendance/:eventid/:studentid', async (req, res) => {
  sqldb = req.con;


  sqldb.query(`select * from eventAndWishingToParticipate where eventId = ${req.params.eventid} and studentId = ${req.params.studentid}`, (err, result) => {
    if (err) {
      console.log(err)
    }



    if (result.length != 0) {



      sqldb.query(`
    select * from eventStudentAndHours where eventId = ${req.params.eventid} and studentId = ${req.params.studentid};
    select * from event where id = ${sqldb.escape(req.params.eventid)} ;
    select * from student where id = ${sqldb.escape(req.params.studentid)} `,


        (err, result) => {



          if (err) {
            res.send("there was an error: " + err)
            return;
          }


          var eventStudentAndHours = result[0];
          var eventtbl = result[1];
          var student = result[2]




          console.log("eventNoOfStudent: " + eventtbl[0].eventNoOfStudent)
          console.log("eventStudentParticipating: " + eventtbl[0].studentParticipating)



          let updatedNo = eventtbl[0].studentParticipating + 1;

          console.log("updatedano: " + updatedNo)





          if (result[0].length == 0) {


            console.log(eventtbl[0].eventNoOfStudent);

            //res.send(eventtbl[0].eventNoOfStudent);


            if (eventtbl[0].studentParticipating < (eventtbl[0].eventNoOfStudent == "No Limit" ? 1000000 : eventtbl[0].eventNoOfStudent)) {


              sqldb.query(`insert into eventStudentAndHours (eventId,studentId,timeIn) values(${sqldb.escape(req.params.eventid)}, ${sqldb.escape(req.params.studentid)},${sqldb.escape(formatAMPM(new Date()))})`, (err, result) => {
                if (err) {
                  res.send("there was an err1: " + err)
                  return
                }

                sqldb.query(`update event set studentParticipating = ${updatedNo} where id = ${req.params.eventid}`, (err, result) => {
                  if (err) {
                    console.log(err)
                  }
                })
                res.send("student has been marked as attending")
                return;
              })

            } else if (eventtbl[0].eventNoOfStudent == "Unlimited Number of Student") {

              sqldb.query(`insert into eventStudentAndHours(eventId,studentId,timeIn) values(${parseInt(req.params.eventid)},${parseInt(req.params.studentid)},${formatAMPM(new Date())})`, (err, result) => {
                if (err) {
                  res.send("there was an err2: " + err)
                  return
                }

                sqldb.query(`update event set studentParticipating = ${updatedNo} where id = ${req.params.eventid}`, (err, result) => {
                  if (err) {
                    console.log(err)
                  }

                })



                res.send("student has been marked as attending")
              })






            } else if (eventtbl[0].studentParticipating == (eventtbl[0].eventNoOfStudent == "No Limit" ? 1000000 : eventtbl[0].eventNoOfStudent)) {
              res.send("no more student are allowed to participate in this event")
            }






          } else {

            res.send("student attendance has already been marked")
            return
          }


          //   res.send("student info not recognized")





        })


    }

    else {

      res.send("student is not one of the partipant for this event, thus attendance can not be marked. ")
    }



  })






  //res.send("working on sth")



})







router.get("/unapproved", async (req,
  res) => {


  sqldb = req.con
  let allEventsMysql;
  //mysql
  sqldb.query("select * from event where eventStatus = false",
    (err, result) => {

      if (err) {
        console.log(err);
        res.send(err);
        return
      }

      allEventsMysql = result;
      console.log(JSON.stringify(allEventsMysql))

      res.send(allEventsMysql);

    })


  //let allEvents = await eventdb.find({eventStatus:false}) ;

})





router.get("/approve/:evid", async (req,
  res) => {

  sqldb = req.con;

  sqldb.query(`update event set eventStatus = 1 where id = ${req.params.evid}`,
    (err, result) => {

      if (err) {
        console.log(err)
        res.send(err)
        return
      }



      io = req.io;

      sqldb.query(`select id from student;select eventName from event where id = ${req.params.evid}`, (err, result1) => {
        if (err) {
          console.log(err)
        }

        let newNotifications = []

        result1[0].forEach((n) => {
          newNotifications.push([`${n.id}`, `a new event has been approved, check the event/activities tab for "${result1[0].eventName}"`])
        })

        sqldb.query(`insert into studentNotification(studentId,notification) values ?`, [newNotifications], (err, result) => {

          if (err) {
            console.log(err)
          }




          // admin insert into admin notification

          sqldb.query(`select id from admin where adminType ="eao";select eventName from event where id = ${req.params.evid}`, (err, result11) => {
            if (err) {
              console.log(err)
            }

            let newNotifications_ = []

            result11[0].forEach((n) => {
              newNotifications_.push([`${n.id}`, `a new event has been approved "${result1[0].eventName}"`])
            })

            sqldb.query(`insert into adminNotification(adminId,notification) values ?`, [newNotifications_], (err, result__) => {

              if (err) {
                console.log(err)
              }

            })
          })









          sqldb.query(`update studentNoOfNotification set noOfNotification = noOfNotification + 1 `, (err, rows) => {


            if (err) {
              console.log("noOfNotification err " + err)
            }



          })







          sqldb.query(`update adminNoOfNotification set noOfNotification = noOfNotification + 1 where adminType = "eao"  `, (err, rows) => {


            if (err) {
              console.log("noOfNotification err " + err)
            }



          })











          io.emit("new event", `${req.params.evid}`)
          io.emit("new event approved by oic for eao", `${req.params.evid}`)



        })



      })











      res.send("event was succesfully  approved")
      console.log(result)
    })


  /*let eventToBeModified = await eventdb.findByIdAndUpdate(req.params.evid,{eventStatus:true}).then(()=>{
  }).catch((e)=>res.send("there was an error pls retry agin"+e))*/


})





router.get("/delete/:evid", async (req,
  res) => {

  let sqldb = req.con

  sqldb.query(`update event set eventStatus = 0 where id = ${req.params.evid} `, (err, result) => {

    if (err) {
      res.send("there was an error: " + err)
    }

    res.send("event was successfully declined")

  })




  /*
let eventToBeModified = await eventdb.findByIdAndDelete(req.params.evid).then(()=> {
  res.send("event was succesfully  deleted")
}).catch((e)=>res.send("there was an error pls retry agin"+e))
*/

})





router.post("/modify/:eventid", upload.single('scannedimage'), async (req,
  res) => {

  sqldb = req.con;

  let noOfStu;
  if (req.body.eventnoofstudent == "" | " ") {
    noOfStu = "Unlimited Number of Student"
  } else {
    noOfStu = req.body.eventnoofstudent
  }


  sqldb.query(`update event set eventName = '${req.body.eventname}', eventHours= '${req.body.eventhours}' , eventNoOfStudent =  '${noOfStu}',
    eventVenue = '${req.body.venue}',
    dateAndTime = '${req.body.dateandtime}',
    scannedImage = '${removePublic(req.file.path)}', schoolYear = '${req.body.schoolyear}', semester = '${req.body.semester}' where id = ${req.params.eventid}
 `, (err, result) => {

    if (err) {
      res.send(err)
      return
    }

    res.send("event has been successfully modified")


  })







  /*
    let wantsToBeModified = await eventdb.findByIdAndUpdate(req.params.eventid.trim(), {
      eventName: req.body.eventname,
      eventHours: req.body.eventhours,
      eventNoOfStudent: noOfStu,
      eventVenue: req.body.venue,
      dateAndTime: req.body.dateandtime,
      scannedImage: removePublic(req.file.path)
  
  
    })
  
    await wantsToBeModified.save().then(()=> {
      res.send("event was succesfully modified")
    }).catch((err)=>res.send(err + " there was an error")) */


})







router.get("/join/:eventid/:studentid", async (req, res) => {
  sqldb = req.con;


  sqldb.query(`select * from eventAndWishingToParticipate  where eventId = ${req.params.eventid} and studentId = ${req.params.studentid};
    select * from event where id = ${sqldb.escape(req.params.eventid)} ;
    select * from student where id = ${sqldb.escape(req.params.studentid)} `,
    (err, result) => {

      if (err) {
        res.send("there was an error: " + err)
        return;
      }


      console.log("eventNoOfStudent: " + result[1][0].eventNoOfStudent)
      console.log("eventStudentParticipating: " + result[1][0].studentParticipating)

      //let updatedNo =  result[1][0].studentParticipating + 1 ;

      //console.log("updatedano: "+ updatedNo)
      //console.log("updatedano: "+ updatedNo)

      if (result[0].length == 0) {

        if (result[1][0].studentParticipating < result[1][0].eventNoOfStudent) {


          sqldb.query(`insert into eventAndWishingToParticipate (eventId,studentId) values(${sqldb.escape(req.params.eventid)}, ${sqldb.escape(req.params.studentid)})`, (err, result) => {
            if (err) {
              res.send("there was an err1: " + err)
              return
            }

            /*       sqldb.query(`update event set studentParticipating = ${updatedNo} where id = ${req.params.eventid}`, (err, result)=> {
              if (err) {
                console.log(err)
              }
            }) */
            res.send("student has been marked as attending")
            return;
          })

        } else if (result[1][0].eventNoOfStudent == "Unlimited Number of Student") {

          sqldb.query(`insert into eventAndWishingToParticipate(eventId,studentId) values(${parseInt(req.params.eventid)},${parseInt(req.params.studentid)})`, (err, result) => {
            if (err) {
              res.send("there was an err2: " + err)
              return
            }

            /*      sqldb.query(`update event set studentParticipating = ${ updatedNo} where id = ${req.params.eventid}`, (err, result)=> {
              if (err) {
                console.log(err)
              }
            }) */



            res.send("student has been marked as attending")
          })






        } else if (result[1][0].studentParticipating == result[1][0].eventNoOfStudent) {
          res.send("no more student are allowed to participate in this event")
        }






      } else {

        res.send("student attendance has already been marked")
        return
      }


      //   res.send("student info not recognized")





    })














  //res.send("still working on this")






})



router.get("/inputrenderedhours/:eventid/:studentid/:hours", async (req,
  res) => {

  sqldb = req.con;

  sqldb.query(`update eventStudentAndHours set timeOut = '${req.params.hours}' where eventId = ${req.params.eventid} and studentId = ${req.params.studentid} `,
    (err, result) => {

      if (err) {
        console.log(err)
        return
      }


      res.send("Timeout has been succesfully modifies")
      console.log(result)

    })
})



router.get("/hour_rendered/:eventid/:studentid/:hours", async (req,
  res) => {

  sqldb = req.con;

  sqldb.query(`update eventStudentAndHours set hourRendered  = '${req.params.hours}' where eventId = ${req.params.eventid} and studentId = ${req.params.studentid} `,
    (err, result) => {

      if (err) {
        console.log(err)
        return
      }


      res.send("Hours rendered has been succesfully updated")
      console.log(result)

    })
})






/*
  let modifyNewRenderedHour = await eventAndRenderedHoursdb.findOneAndUpdate({
    eventId: req.params.eventid.trim(),
    studentId: req.params.studentid
  },
    {
      renderedHours: req.params.hours
    }).then(()=>res.send("rendered hours has been saved successful")).catch((err)=> {
      res.send("error pls try again " +err)}) */


//})




router.get("/mark_done/:eventid", (req, res) => {
  sqldb = req.con

  sqldb.query(`update event set isEventDone = 1 where id =${req.params.eventid} `, (err, result) => {

    if (err) {
      res.send(err)
      return
    }


    res.send("successfully marked as done")

  })



})



router.get("/participating_in/:studentid", (req, res) => {
  sqldb = req.con;

  sqldb.query(`select * from eventAndWishingToParticipate join event on eventAndWishingToParticipate.eventId = event.id  where studentId = ${req.params.studentid}`, (err, result) => {
    if (err) {
      res.send(err)
      return
    }

    res.send(result)


  })



})


router.get("/cancelParticipation/:eventid/:studentid", (req, res) => {

  sqldb = req.con;

  sqldb.query(`delete from eventAndWishingToParticipate where studentId = ${req.params.studentid} and eventId = ${req.params.eventid}`, (err, result) => {
    if (err) {
      res.send(err)
      return
    }



    sqldb.query(`delete from eventStudentAndHours where studentId = ${req.params.studentid} and eventId = ${req.params.eventid}`, (err, result) => {
      if (err) {
        res.send(err)
        return
      }

      //  console.log("deleted... "+ JSON.stringify(result))

      res.send("You are no longer participating in this event")



    })





    //  res.send("participation was canceled succesfully")



  })



})



router.get("/timeout/:eventid/:studentid", (req, res) => {

  sqldb = req.con;

  sqldb.query(`select * from eventStudentAndHours where eventId = ${sqldb.escape(req.params.eventid)} and studentId = ${req.params.studentid.replace("%20%20", " ")}`, (err, rowss) => {

    if (err) {
      res.send("there was an error " + err)
      return
    }

    if (rowss.length == 0) {
      res.send("the student has not been mark as attending for this event, thus timeout could not be input")
      return
    }


    sqldb.query(`update eventStudentAndHours set timeOut = ${formatAMPM(new Date())} where eventId = ${sqldb.escape(req.params.eventid)} and studentId = ${req.params.studentid.replace("%20%20", " ")}`, (err, result_) => {

      if (err) {
        res.send("therw was an error: " + err)
      }


      res.send("timeout for student was succesfully input")
    })
  })

})




router.get(`/event-attendees`,(req,res)=>{

 
  sqldb = null;
  sqldb = req.con;

  sqldb.query('select stud.id as studrow, stud.studentNo,stud.firstName,stud.surname,stud.course,stud.academicYearStarted,evnt.id as eventID,evnt.eventName,evnt.eventStartDate,evnt.eventEndDate,evnt.eventVenue,evnt.semester,evnt.schoolYear,CONCAT(esh.hourRendered," Hours") as hours from event as evnt left join eventstudentandhours as esh on evnt.id = esh.eventId inner join student as stud on stud.id = esh.studentId', (err, result) => {

    if (err) {
      res.send("therw was an error: " + err)
    }

    res.send(result)

  })
})










router.get('/hour-multiplier/:studentid/:hrx', async (req, res) => {

  let hrx = req.params.hrx;
  let studentid = req.params.studentid;

  sqldb = req.con;

  sqldb.query(`update eventstudentandhours set hours_multiplier = ${hrx} where studentId = ${studentid} `, (err, rows, fields) => {
    if (err) {
      res.send(err);
      return;
    }

    res.send("Updated")
  })






});





router.get('/:eventid', async (req,
  res) => {

  //mysql
  sqldb = req.con;

  sqldb.query(`
    select * from event where id = ${req.params.eventid} ;
    select * from eventStudentAndHours join student on eventStudentAndHours.studentId = student.id  where eventId = ${req.params.eventid}
    `,
    (err, result) => {
      console.log(JSON.stringify(result))
      if (err) {
        res.send(err);
        return;
      }

      console.log(result)
      res.send(result)


    })



  /*
  let events = await eventdb.findOne({_id:mongoose.Types.ObjectId(req.params.eventid)}).populate('studentParticipating').populate({path:'studentParticipatingAndHoursRendered',populate:{path:"studentId"}})
  console.log(JSON.stringify(events.studentParticipatingAndHoursRendered))
 res.send(events) */



})






function removePublic(string) {
  return string.slice(7)
}



function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return JSON.stringify(strTime)
}







module.exports = router;


//markAttendance mongodbbb4

/*
  let newEventAndRenHours = await new eventAndRenderedHoursdb({
    eventId:eventToBeModified._id,
    studentId:newStuParticipating._id,
  });
  await newEventAndRenHours.save() ;
  eventdb.findByIdAndUpdate(req.params.eventid.replace("%20%20"," ").trim(),{$push:{studentParticipating:req.params.studentid.replace("%20%20"," "),studentParticipatingAndHoursRendered:newEventAndRenHours._id}}).then(()=>res.send("the student has been succesfully added to the event as attending")).catch((e)=>{res.send("there was an error pls retry") ;  })
}*/




/*
let newEventAndRenHours = await new eventAndRenderedHoursdb({
    eventId:eventToBeModified._id,
    studentId:newStuParticipating._id,
  });
  await newEventAndRenHours.save() ;


      eventdb.findByIdAndUpdate(req.params.eventid.replace("%20%20"," ").trim(),{$push:{studentParticipating:req.params.studentid.replace("%20%20"," "),studentParticipatingAndHoursRendered:newEventAndRenHours._id}}).then(()=>res.send("the student has been succesfully added to the event as attending")).catch((e)=>{res.send("there was an error pls retry") ;  }) */






/*
  let newStuParticipating = await studentdb.findById(req.params.studentid.replace("%20%20"," "))
 let eventToBeModified = await eventdb.findById(req.params.eventid.replace("%20%20"," ").trim()).populate('studentParticipating')
  let studentAlreadyRegistered = await eventdb.findById(req.params.eventid.trim())
  //,{studentParticipating: { $in: [req.params.studentid] }})
 let statusOfStudentAlreadyRegistered = studentAlreadyRegistered.studentParticipating.find((h)=>{return h == req.params.studentid})
  //console.log(Boolean(statusOfStudent))
  //  console.log(studentAlreadyRegistered)
  if(newStuParticipating && eventToBeModified) {
    if(Boolean(statusOfStudentAlreadyRegistered)) {
      res.send("Student has already been marked as attending ")
    }

else if(eventToBeModified.studentParticipating.length == "Unlimited Number of Student" ) {
  //mysql
  sqldb.query(`insert into eventStudentAndHours(eventId,studentId) values(${eventToBeModifiedMysql.id},${newStuParticipatingMysql.id})`,(err,result)=>{
    if(err) {
      console.log(err)
      return ;
    }
    console.log(result)
  })
  let newEventAndRenHours = await new eventAndRenderedHoursdb({
    eventId:eventToBeModified._id,
    studentId:newStuParticipating._id,
  });
  await newEventAndRenHours.save() ;
  eventdb.findByIdAndUpdate(req.params.eventid.replace("%20%20"," ").trim(),{$push:{studentParticipating:req.params.studentid.replace("%20%20"," "),studentParticipatingAndHoursRendered:newEventAndRenHours._id}}).then(()=>res.send("the student has been succesfully added to the event as attending")).catch((e)=>{res.send("there was an error pls retry") ;  })
}



    else if(eventToBeModified.studentParticipating.length == eventToBeModified.eventNoOfStudent) {
      res.send("no more students are allowed to participate in this event")
    }

    else {
  //mysql
  sqldb.query(`insert into eventStudentAndHours(eventId,studentId) values(${eventToBeModifiedMysql.id},${newStuParticipatingMysql.id})`,(err,result)=>{
    if(err) {
      console.log(err)
      return ;
    }
    console.log(result)
  })



let newEventAndRenHours = await new eventAndRenderedHoursdb({
    eventId:eventToBeModified._id,
    studentId:newStuParticipating._id,
  });
  await newEventAndRenHours.save() ;


      eventdb.findByIdAndUpdate(req.params.eventid.replace("%20%20"," ").trim(),{$push:{studentParticipating:req.params.studentid.replace("%20%20"," "),studentParticipatingAndHoursRendered:newEventAndRenHours._id}}).then(()=>res.send("the student has been succesfully added to the event as attending")).catch((e)=>{res.send("there was an error pls retry") ;  })

    }
  }
    */