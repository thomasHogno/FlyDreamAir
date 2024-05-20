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
const { title } = require("process");
const Service = require("./models/service.js");

// here
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const methodOverride = require('method-override')

const initializePassport = require('./templates/passport-config.js');

initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id),
)

const users = []
// here


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


// here
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
//here

mongoose
  .connect(
    "mongodb+srv://phuongdao:4NIfXCvBa0sd3AYT@flydreamdb.pgvinhz.mongodb.net/?retryWrites=true&w=majority&appName=FlyDreamDB"  )
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

// here

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index', { name: req.user.name, title:"Homepage"})
})


app.get('/index',(req,res)=>{
    res.render("index",{title:"Homepage"})})



app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs', {title:"Login"})
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true

}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register',{title:"register"})
})



app.post('/register', checkNotAuthenticated,  async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})

app.get('/logout',(req,res)=>{
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

// here















app.get("/bookOnline",(req,res)=>{
res.render('searchFlight', {title:"Search Flight"});
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

app.get('/myBookings',(req,res)=>{
    res.render('myBookings',{title:"My Bookings",loggedIn: loggedIn})
})

app.get('/myFlightServices',(req,res)=>{
    res.render('myFlightServices',{title:"My Fligth Services",loggedIn: loggedIn})
})

app.post('/submit_inquiry',(req,res)=>{
    res.redirect('contactUs',{form_submitted: true})})


app.post('/searchFlight', async (req,res)=>{
    const inputFlight = req.body;
    console.log(inputFlight);
    const flights = await Flight.find({
        "departureCity":capitalize(inputFlight.departureCity), 
        "destinationCity": capitalize(inputFlight.destinationCity)
    });

    const flightType = req.body.flightType;

    req.session.flights = flights;
    req.session.inputFlight = inputFlight;
    req.session.flightType = flightType;

    if (flightType === 'Round Trip') {
        req.session.returnDate = req.body.returnDate;
    } else {
        req.session.returnDate = null; // Clear return date for one way trip
    }

    console.log(`Flight Type: ${flightType}`);
    console.log(`Return Date: ${req.session.returnDate}`);

    res.redirect('/chooseTicket');
})

const moment = require('moment');

app.get('/chooseTicket', (req, res) => {
    let flights = req.session.flights || [];
    const inputFlight = req.session.inputFlight;
    let message = null;

    flights.forEach(flight => {
        const departureTime = moment(flight.departureTime, 'hh:mm A');
        const duration = moment.duration(flight.duration, 'hours');
        const arrivalTime = departureTime.clone().add(duration);

        flight.departureDate = departureTime.format('lll');
        flight.arrivalDate = arrivalTime.format('lll');
    });

    if (flights.length === 0) {
        message = `No available flights between ${inputFlight.departureCity} and ${inputFlight.destinationCity}`;
    }

    res.render('chooseTicket', { "title": "Ticket", flights, message });
});

app.post('/chooseTicket', (req, res) => {
    const flightType = req.session.flightType;
    const flightNo = req.body.flightNo;
    req.session.flightNo = flightNo;

    let selectedFlight = req.session.flights.find(flight => flight.flightNo === flightNo);

     if (selectedFlight) {
        req.session.selectedFlight = selectedFlight;
        req.session.arrivalTime = selectedFlight.arrivalDate;
    }

    if (flightType === 'Round Trip') {
        res.redirect('/returnTickets');
    } else {
        res.redirect('/fillPassengerInfor');
    }
});

// RETURN TICKET
app.get('/returnTickets', async (req, res) => {
    const selectedFlight = req.session.selectedFlight;
    const returnDate = req.session.returnDate;
    let message = null;
    
    if (!selectedFlight || !returnDate) {
        message = 'Return date or selected flight is not set.';
        return res.render('returnTickets', { "title": "Return Ticket", flights, message });
    }

    const returnFlights = await Flight.find({
        "departureCity": capitalize(selectedFlight.destinationCity),
        "destinationCity": capitalize(selectedFlight.departureCity),
        "departureTime": { 
            $gte: moment(returnDate).startOf('day').toISOString(), 
            $lt: moment(returnDate).endOf('day').toISOString() }
    });

    if (returnFlights.length === 0) {
        message = `No available flights between ${selectedFlight.destinationCity} and ${selectedFlight.departureCity} on ${returnDate}`;
    } else {
        returnFlights.forEach(flight => {
            const departureTime = moment(flight.departureTime, 'hh:mm A');
            const duration = moment.duration(flight.duration, 'hours');
            const arrivalTime = departureTime.clone().add(duration);
    
            flight.departureDate = departureTime.format('lll');
            flight.arrivalDate = arrivalTime.format('lll');
        });
    }

    res.render('returnTickets', { "title": "Return Ticket", flights, message });
});

// RETURN TICKET -> FILL PASSENGER INFO
app.post('/returnTickets', (req, res) => {
    const flightNo = req.body.flightNo;
    req.session.returnFlightNo = flightNo;

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

// here


function checkAuthenticated(req, res , next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

// here
