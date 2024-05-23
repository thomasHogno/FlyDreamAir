// here

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
// here

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
const Account = require("./models/account.js");
const Service = require("./models/service.js");

// here
const bcrypt = require('bcrypt')
const passport = require('passport')
const methodOverride = require('method-override')
const initializePassport = require('./templates/passport-config.js');

let users = [];

async function getAllUsers() {
    users = await Account.find() || [];
}

(async () => {
    await getAllUsers();
    initializePassport(
        passport, 
        email => users.find(user => user.email === email),
        id => users.find(user => user.id === id),
    );
})();


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

// here

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
//here

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

let loggedIn = false
app.get("/bookOnline",(req,res)=>{
res.render('searchFlight', {title:"Search Flight",loggedIn:loggedIn});
});

// here

app.get('/', (req, res) => {
    res.redirect('index')
})


app.get('/index',(req,res)=>{
    res.render("index",{title:"Homepage",loggedIn: loggedIn})})



app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs', {title:"Login", loggedIn: loggedIn})
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true

}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register',{title:"register",loggedIn:loggedIn})
})



app.post('/register', checkNotAuthenticated,  async (req, res) => {
    try {
        const data = req.body;
        const hashedPassword = await bcrypt.hash(data.password, 10)
        const user = await User.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})

app.get('/logout',(req,res)=>{
    loggedIn = false;
    res.redirect(`/index?loggedIn=${loggedIn}`);
})

app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login')
    })
})


app.get("/bookOnline",(req,res)=>{
res.render('searchFlight', {title:"Search Flight",loggedIn:loggedIn
});
});



app.get('/dashboard',(req,res)=>{
    res.render('dashboard',{title:"Dashboard","loggedIn":loggedIn})
})

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
const User = require('./models/account.js');

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

    res.render('chooseTicket', { title: "Ticket", flights, message,loggedIn:loggedIn });}
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
        loggedIn: loggedIn
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
    total: total,
    loggedIn: loggedIn
});
})

app.post('/makePayment',(req,res)=>{
    res.render('successBooking',{title:"Success",loggedIn:loggedIn})
})

function capitalize(string) {
    return string.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// here


function checkAuthenticated(req, res , next) {
    if (req.isAuthenticated()) {
        loggedIn = true;
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        loggedIn = true;
        console.log("log in success")
        return res.redirect('/')
    }
    next()
}

// here
