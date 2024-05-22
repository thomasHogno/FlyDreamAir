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

const username = "ddsgdfg";

mongoose
  .connect(
    "mongodb+srv://csit214:jVxpHaaTBrO7AhY6@flydreamdb.pgvinhz.mongodb.net/?retryWrites=true&w=majority&appName=FlyDreamDB"  )
  .then(() => {
    console.log("Connected to database!");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(() => {
    console.log("Connection failed!");
  });

loggedIn = false
app.get("/bookOnline",(req,res)=>{
res.render('searchFlight', {title:"Search Flight"});
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

// app.get('/myBookings', async (req,res)=>{
//     let flights = []
//     if(username){
//         flights = await Service.find({username:username});
//     }
//     res.render('myBookings',{title:"My Bookings",loggedIn: loggedIn,flights:flights})
// })

app.get('/myFlightServices',(req,res)=>{
    res.render('myFlightServices',{title:"My Fligth Services",loggedIn: loggedIn})
})

app.post('/submit_inquiry',(req,res)=>{
    res.redirect('contactUs',{form_submitted: true})})

app.get('/index',(req,res)=>{
    res.render("index",{title:"Homepage"})})

app.post('/searchFlight', async (req,res)=>{
    const inputFlight = req.body;
    const flights = [];
    const departureFlights = await Flight.find({
        "departureCity":capitalize(inputFlight.departureCity), 
        "destinationCity": capitalize(inputFlight.destinationCity)
    });
    flights.push(departureFlights);
    const flightType = req.body.flightType;

    if (flightType === 'Round Trip') {
        const returnFlights = await Flight.find({
            "departureCity":capitalize(inputFlight.destinationCity), 
            "destinationCity": capitalize(inputFlight.departureCity)
        });
    
        flights.push(returnFlights);
        console.log(flights.length)
    } else {
        req.session.returnDate = null; // Clear return date for one way trip
    }

    req.session.flights = flights;
    req.session.inputFlight = inputFlight;
    req.session.flightType = flightType;
    res.redirect('/chooseTicket');
})

const moment = require('moment');

app.get('/chooseTicket', (req, res) => {
    let flights = req.session.flights || [];
    const inputFlight = req.session.inputFlight;
    let message = null;

    if (inputFlight && inputFlight.departureDate) {
        const chosenDepartureDate = moment(inputFlight.departureDate, 'YYYY-MM-DD');

        flights[0].forEach(flight => {
            const departureTime = moment(flight.departureTime, 'hh:mm A');
            const departureDateTime = chosenDepartureDate.clone().set({
                hour: departureTime.hour(),
                minute: departureTime.minute(),
                second: 0,
                millisecond: 0
            });

            const duration = moment.duration(flight.duration, 'hours');
            const arrivalDateTime = departureDateTime.clone().add(duration);

            flight.departureDate = departureDateTime.format('lll');
            flight.arrivalDate = arrivalDateTime.format('lll');
        });

        if (flights.length === 0) {
            message = `No available flights between ${inputFlight.departureCity} and ${inputFlight.destinationCity}`;
        }

        if (flights.length > 1) {
            const chosenReturnDate = moment(inputFlight.returnDate, 'YYYY-MM-DD');
            flights[1].forEach(flight => {
                const departureTime = moment(flight.departureTime, 'hh:mm A');
                const departureDateTime = chosenReturnDate.clone().set({
                    hour: departureTime.hour(),
                    minute: departureTime.minute(),
                    second: 0,
                    millisecond: 0
                });

                const duration = moment.duration(flight.duration, 'hours');
                const arrivalDateTime = departureDateTime.clone().add(duration);

                flight.departureDate = departureDateTime.format('lll');
                flight.arrivalDate = arrivalDateTime.format('lll');
            });
        }
    }

    res.render('chooseTicket', { title: "Ticket", flights, message });}
)

app.post('/chooseTicket', (req, res) => {
    const departureFlightNo = req.body.departureFlightNo;
    const departureFlightClass = req.body.departureFlightClass;
    const totalFlightPrice = req.body.totalFlightPrice;
    req.session.totalFlightPrice = totalFlightPrice;
    req.session.departureFlightNo = departureFlightNo;
    req.session.departureFlightClass = departureFlightClass;
     if (req.body.returnFlightNo) {
        const returnFlightNo = req.body.returnFlightNo;
        const returnFlightClass = req.body.returnFlightClass;
        req.session.returnFlightNo = returnFlightNo;
        req.session.returnFlightClass = returnFlightClass;
    }

        res.redirect('/fillPassengerInfor');
});


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
    let isReturnFlight = false;
    const returnFlightNo = req.session.returnFlightNo;
    if(returnFlightNo){
        isReturnFlight = true;
        }
    res.render('chooseService',{
        title:"Services", 
        isReturnFlight: isReturnFlight,
    })
})

app.post('/chooseServices', async (req,res)=>{
    try{
        const passengerPassport = req.session.passengerPassport;
        const departureFlightNo = req.session.departureFlightNo;
        const data = req.body;
        const departureFoodPrice = data.departureFood;
        let departureFood = "";
        if(departureFoodPrice==0){
            departureFood = "No";
        }else if(departureFoodPrice == "10"){
            departureFood = "Chicken Rice + Free Drink";
        }else{
            departureFood = "Singapore Noodle + Free Drink"
        }
        req.session.servicePrice = data.totalFee;
        const service = await Service.create(
            {"passengerPassport":passengerPassport,
            "flightNo":departureFlightNo,
            "seat": data.departureSeat,
            "baggage": data.departureBaggage,
            "priority": data.departurePriority,
            "insurance": data.departureInsurance,
            "food": departureFood,
            "flightClass": req.session.departureFlightClass
        });
        if(req.session.returnFlightNo){
            const returnFoodPrice = data.returnFood;
            let returnFood = "";
            if(returnFoodPrice==0){
                returnFood = "No";
            }else if(returnFoodPrice == "10"){
                returnFood = "Chicken Rice + Free Drink";
            }else{
                returnFood = "Singapore Noodle + Free Drink"
            }
            const service = await Service.create(
                {"passengerPassport":passengerPassport,
                "flightNo":req.session.returnFlightNo,
                "seat": data.returnSeat,
                "baggage": data.returnBaggage,
                "priority": data.returnPriority,
                "insurance": data.returnInsurance,
                "food": returnFood,
                "flightClass": req.session.returnFlightClass
            });
        }
        res.redirect('/makePayment'); 
      }
         catch(error){
             res.status(500).json({
                 message: error.message
             })
         }})

app.get('/makePayment',async(req,res)=>{
    const totalFlightPrice = req.session.totalFlightPrice;
    const totalServicePrice = req.session.servicePrice;
    const total = parseInt(totalFlightPrice) + parseInt(totalServicePrice);
    res.render('makePayment',
    {
        title: 'Payment',
    flightPrice:totalFlightPrice,
    servicePrice: totalServicePrice,
    total: total
});
})

app.post('/makePayment',(req,res)=>{
    res.render('successBooking',{title:"Success"})
})

function capitalize(string) {
    return string.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}