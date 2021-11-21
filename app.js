const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('./config.json');
const TransportConfig = require('./model/TransportConfig');
const Output = require('./model/Output');
const MailConfig = require('./model/MailConfig');
const app = express();

//view enine setup
var hbs = exphbs.create({defaultLayout: 'main', extname:'.hbs'});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

//Static folder 
app.use('/public',express.static(path.join(__dirname,'public')));


//Body Parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

app.get('/',(req,res)=>{
    res.render('contact');
})

app.post('/send',(req,res)=>{
    //Validate email id:
    let email = req.body.email;
    console.log(email);
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if(!re.test(String(email).toLowerCase())){
        res.status(400).send({'error' : 'Email address not found'});
        return;
    }
    const output = new Output(req.body.message);
    const emailContent = output.body;
    // setup email data with unicode symbols
    const mailOptions = new MailConfig(config.email, req.body.email, req.body.subject, emailContent);

    // create reusable transporter object  
    let primaryService = new TransportConfig(config.primaryService.host, 587 , false, config.primaryService.user, config.primaryService.pass, false );
    
    
    // send mail with defined transport object    
    const transporter = nodemailer.createTransport(primaryService);
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            console.log('first service failed')
            let secondaryService = new TransportConfig(config.secondaryService.host, 587 , false, config.secondaryService.user, config.secondaryService.pass, false );
            const transporter2 = nodemailer.createTransport(secondaryService);
            transporter2.sendMail(mailOptions, (error,info)=>{
                if(error){
                    console.log(error);
                    console.log('Both service failed')
                    res.render('error', 'Both Email services are down. Please try after sometime');
                    return;
                }
                console.log('message send by second service')
                console.log('Message sent: %s', info.messageId);   
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                res.render('confirmation', {msg:`Email has been sent message id : ${info.messageId}`});                  
            })
            return;
        }
        console.log('message send by first service');
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('confirmation', {msg:`Email has been sent message id : ${info.messageId}`}); 
    }) 
})  

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});
