const express = require('express');
const router = express.Router();
const studentdb = require('../models/student');

var base64ToImage = require('base64-to-image');

var QRCode = require('qrcode')




router.get('/', (req, res) => {
  res.render('student')
})


router.post('/', async (req, res) => {

  sqldb = req.con;
  // mysql
  sqldb.query(`select * from student where studentNo = "${req.body.studentid}" `, (err, result) => {

    if (err) {
      res.send(err)
      console.log(err)
      return
    }

    currentStudent = result[0]
    let noOfNotification

    console.log(result)

    if (currentStudent && currentStudent.password == req.body.password) {

      sqldb.query(`select * from studentNoOfNotification where studentId = ${currentStudent.id}`, (err, rows_) => {

        QRCode.toDataURL(currentStudent.id.toString(), function (err, url) {
          studentqrCode = url;
          res.render('studentdashboard', { currentStudent, url, noOfNotification: rows_[0].noOfNotification })
        })

      })
    }


    else {
      res.send("Student with these credentials does not exist or is incorrect, please coordinate with OIC for your account. Thank You!")

    }




  })
})

router.post("/change_password/:studentid", (req, res) => {

  sqldb = req.con;

  sqldb.query(`select * from student where id = ${req.params.studentid}`, (err, result) => {
    if (err) {
      res.send(err)
      return
    }

    student = result[0]
    console.log("admin: " + JSON.stringify(student))

    if (student.password == req.body.currentpassword) {

      sqldb.query(`update student set password ='${req.body.newpassword}' where id =${req.params.studentid}`, (err, result) => {
        if (err) {
          res.send("password could not be changed . Please try again: " + err)
          return;
        }

        res.send("password was changed successfully")
        return;
      })
    }


  })
})



router.get("/dashboard/:studentid", (req, res) => {

  sqldb = req.con;

  sqldb.query(`select * from eventAndWishingToParticipate join event on eventAndWishingToParticipate.eventId = event.id  
    where studentId = ${req.params.studentid} ;
    select * from eventStudentAndHours join event on eventStudentAndHours.eventId = event.id  where studentId = ${req.params.studentid}
    `, (err, result) => {

    if (err) {
      res.send(err)
      return
    }

    console.log("ggggg" + JSON.stringify(result))

    res.send(result)
  })


})

//let currentStudent = await studentdb.findOne({studentNo:req.body.studentid})

//let allStudent = await studentdb.find() ;
//console.log(allStudent)

router.get("/notifications/:studentid", (req, res) => {

  sqldb = req.con


  sqldb.query(`select * from studentNoOfNotification where studentId = ${sqldb.escape(req.params.studentid)}`, (err, rows) => {

    if (err) {
      console.log(err)
    }

    console.log("vvvvvv---66---5------ rows " + JSON.stringify(rows
    ))

    //  res.status(200)
    res.send(rows)


  })





})



router.get(`/all_notification/:studentid`, (req, res) => {

  sqldb = req.con;


  sqldb.query(`select * from studentNotification where studentId =${req.params.studentid.replace("%20", " ").trim()} order by id desc`, (err, result) => {

    if (err) {
      res.send(err)
      return
    }


    sqldb.query(`update studentNoOfNotification set  noOfNotification = 0 where studentId = ${sqldb.escape(req.params.studentid)} `, (err, result__) => {
      if (err) {
        console.log("err- " + err)
      }
    })


    res.send(result)



  })




})
















module.exports = router;

