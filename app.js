var createError = require('http-errors');
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql      = require('mysql');  

var connection = mysql.createConnection({
  host     :'localhost',
  user     :'root',
  password : 'Test1234',
  database:'plvscdb',
  multipleStatements: true
  
});


/*
var connection = mysql.createConnection({
  host: 'sql6.freemysqlhosting.net',
  user: 'sql6482238',
  password: '6Rw8l7HZfx',
  database: 'sql6482238',
  multipleStatements: true

});*/
 
 
 
connection.connect((err)=>{
    if(err) {
        console.log(err)
        return ;
    }
    
  console.log('connected as id ' + connection.threadId);
  
    
    
});




/*
sql = "select id from student"



connection.query(sql,(err,result)=>{
  if(err) {
    console.log(err)
  }
  
  console.log(result)
  
  
})  */




const QrScanner = require('qr-scanner')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var studentRouter = require('./routes/student');
var eventRouter = require('./routes/event');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);



io.on('connection',async(socket)=>{
  
  console.log("a user connected")
  
  
  
  
})











/*

const uri = "mongodb+srv://Ibrahim:ib130860011@cmrtcforum.dj6tu.mongodb.net/qrcodesla?retryWrites=true&w=majority";

mongoose.connect('mongodb://localhost:27017/newPlvsc',
  {
    useNewUrlParser: true,
    // useFindAndModify: false,
    useUnifiedTopology: true
  }
).then(()=> {
    console.log("connected successfuly")})
*/



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function (req, res, next) {
    req.con = connection
    next();
});

app.use(function(req, res, next) {
    req.io = io;
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/student', studentRouter);
app.use('/event', eventRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = {
  app: app,
  server: server
};

//module.exports = app;
