const mongoose = require("mongoose"); 
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// const cors = require("cors")
const express = require("express")
const session = require('express-session');
const dotenv = require("dotenv").config();
const app = express();
const path = require('path');
const port = process.env.PORT || 5000; 
const bodyParser = require('body-parser');
const Passenger = require("./models/passenger.js");
const Flight = require("./models/flight.js");
const { title } = require("process");
const Service = require("./models/service.js");
//register view engine
app.set('view engine', 'ejs');
app.set('views','templates');
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: process.env.SESSION_SECRET, // Change this to your secret key
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://replace-with-your-username:replace-with-your-password-for-this-collection@flydreamdb.pgvinhz.mongodb.net/?retryWrites=true&w=majority&appName=FlyDreamDB"
  )
  .then(() => {
    console.log("Connected to database!");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(() => {
    console.log("Connection failed!");
  });

loggedIn = true
app.get("/bookOnline",(req,res)=>{
res.render('searchFlight');
});

app.get('/login',(req,res)=>{
    res.render('login',{title:"Login"})
})

app.get('/logout',(req,res)=>{
    res.redirect(`/index?loggedIn=${loggedIn}`);
})

app.get('/dashboard',(req,res)=>{
    res.render('dashboard',{title:"Dashboard","loggedIn":loggedIn})
})

app.get('/', (req, res) => {
    res.redirect(`/index?loggedIn=${loggedIn}`);
});


app.get('/contactUs',(req,res)=>{
    res.render('contactUs',{title:"Contact Us",form_submitted: false, loggedIn: loggedIn})
})

app.get('/about',(req,res)=>{
    res.render('about',{title:"About Us",loggedIn: loggedIn})
})

app.get('/myAccount',(req,res)=>{
    res.render('myAccount',{title:"My Account",loggedIn: loggedIn})
})

app.get('/myBookings',(req,res)=>{
    res.render('myBookings',{title:"My Bookings",loggedIn: loggedIn})
})

app.get('/myFlightServices',(req,res)=>{
    res.render('myFlightServices',{title:"My Fligth Services",loggedIn: loggedIn})
})

app.post('/submit_inquiry',(req,res)=>{
    res.redirect('contactUs',{form_submitted: true})})

app.get('/index',(req,res)=>{
    res.render("index",{title:"Homepage"})})

app.post('/searchFlight', async (req,res)=>{
    const inputFlight = req.body;
    const flights = await Flight.find({"departureCity":capitalize(inputFlight.departureCity), "destinationCity": capitalize(inputFlight.destinationCity)})   
    req.session.flights = flights;
    req.session.inputFlight = inputFlight;
    res.redirect('/chooseTicket');
})

 app.get('/chooseTicket',(req,res)=>{
    const flights = req.session.flights || [];
    const inputFlight = req.session.inputFlight;
    let message = null;
    if (flights.length === 0) {
            message = `No available flights between ${inputFlight.departureCity} and ${inputFlight.destinationCity}`
    }
    res.render('chooseTicket',{flights,message});
});

app.post('/chooseTicket',(req,res)=>{
    const flightNo = req.body.flightNo;
    req.session.flightNo = flightNo;
    res.redirect('/fillPassengerInfor');
})



app.get('/fillPassengerInfor',(req,res)=>{
    console.log(req.session.flightNo)
    res.render('passengerInfo',{title:'Passenger',loggedIn:loggedIn})
})

app.post('/fillPassengerInfor', async (req,res)=> { try{
    const passport = req.body.passport;
    let passenger = Passenger.exists({"passport": passport})
    if(passenger == null){
        passenger = await Passenger.create(req.body); 
    }
    req.session.passengerPassport = passport;
    res.redirect('/chooseServices');
       }
     catch(error){
         res.status(500).json({
             message: error.message
         })
     }})

app.get('/chooseServices',(req,res)=>{
    res.render('chooseService',{title:"Services"})
})

app.post('/chooseServices', async (req,res)=>{
    try{
        console.log(req.body);
        console.log(req.session);
        const passengerPassport = req.session.passengerPassport;
        const flightNo = req.session.flightNo;
        const data = req.body;
        req.session.servicePrice = data.totalFee;
        const service = await Service.create(
            {"passengerPassport":passengerPassport,
            "flightNo":flightNo,
            "seat": data.seat,
            "baggage": data.baggage,
            "priority": data.priority,
            "insurance": data.insurance,
            "totalFee": data.totalFee
        });
        res.redirect('/makePayment'); 
      }
         catch(error){
             res.status(500).json({
                 message: error.message
             })
         }})

app.get('/makePayment',async(req,res)=>{
    const flightNo = req.session.flightNo;
    const flight = await Flight.find({"flightNo": flightNo})  
    console.log(flight) ;
    const flightPrice = flight[0].price;
    console.log(flightPrice)
    const servicePrice = req.session.servicePrice;
    const total = parseInt(flightPrice) + parseInt(servicePrice);
    res.render('makePayment',
    {
        title: 'Payment',
    flightPrice:flightPrice,
    servicePrice: servicePrice,
    total: total
});
})

app.post('/makePayment',(req,res)=>{
    res.render('successBooking',{title:"Success"})
})

function capitalize(string) {
    return string.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}



