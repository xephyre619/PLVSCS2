var express = require('express'); 
var router = express.Router();
var user = require('../user') ;

var base64ToImage = require('base64-to-image');

var QRCode = require('qrcode')





/* GET home page. */
router.get('/', function(req, res, next) {
  
  
res.render('login');
});




router.get('/forgot_password',(req,res)=>{
  res.send(req.query.user)
})









/*

router.post('/home',async(req,res)=>{
  name = req.body.name ;
  if(req.body.password == req.body.password2) {
    
    newUser = await new user({name:name,email:req.body.email,password:req.body.password})
   await  newUser.save() ;
   
   let lk = await user.findOne({name:name})
   
   if(lk.qrcodes.length !=0) {
  status = 'd-block'
}
else{
status = 'd-none'
}
   
  res.render('generate',{name:req.body.name,src:lk.qrcodes,status})
  


  
  
  
  }
  
  
  
  
  
})



router.post('/generate/:name',async(req,res)=>{
  
  currentUser = await user.findOne({name:req.params.name})
  
  QRCode.toDataURL(req.body.textToBeConverted, async function (err, url) {
    
    var base64Str = url
  
  
  
var path ='public/images/';
var optionalObj = {'fileName': new Date() +"hhb", 'type':'png'};

info = 	base64ToImage(base64Str,path,optionalObj); 

currentUser.qrcodes = await currentUser.qrcodes.concat(info.fileName) ;

await currentUser.save() ;

let updateduser = await user.findOne({name:req.params.name})

if(updateduser.qrcodes.length !=0) {
  status = 'd-block'
}
else{
status = 'd-none'
}
res.render('generate',{src:updateduser.qrcodes,status,name:req.params.name
})
	
  
})
  
  
  
    
  
  
  
})
*/




module.exports = router;


