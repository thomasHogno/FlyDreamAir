if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require("mongoose");
const express = require("express");
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const passport = require('passport');
const methodOverride = require('method-override');
const initializePassport = require('./templates/passport-config.js');
const Account = require("./models/account.js");
const Passenger = require("./models/passenger.js");
const Flight = require("./models/flight.js");
const Service = require("./models/service.js");
const app = express();
const port = process.env.PORT || 5000;

async function getUserByEmail(email) {
    return await Account.findOne({ email: email });
}

async function getUserById(id) {
    return await Account.findById(id).exec();
}

initializePassport(
    passport, 
    getUserByEmail, 
    getUserById
);

app.set('view engine', 'ejs');
app.set('views', 'templates');
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET, // Change this to your secret key
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect("mongodb+srv://csit214:jVxpHaaTBrO7AhY6@flydreamdb.pgvinhz.mongodb.net/?retryWrites=true&w=majority&appName=FlyDreamDB")
    .then(() => {
        console.log("Connected to database!");
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(() => {
        console.log("Connection failed!");
    });

let loggedIn = false;

app.get("/bookOnline", (req, res) => {
    res.render('searchFlight', { title: "Search Flight", loggedIn: loggedIn });
});

app.get('/', (req, res) => {
    res.redirect('index');
});

app.get('/index', (req, res) => {
    res.render("index", { title: "Homepage", loggedIn: loggedIn });
});

app.get('/login', (req, res) => {
    res.render('login', { title: "Login", loggedIn: loggedIn, messages: req.flash('error') });
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Error during authentication:', err);
            return next(err);
        }
        if (!user) {
            console.log('Authentication failed:', info.message);
            return res.render('login', { title: "Login", loggedIn: false, messages: [info.message] });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Error during login:', err);
                return next(err);
            }
            console.log("log in success");
            loggedIn = true; // Set loggedIn to true upon successful login
            return res.redirect('/');
        });
    })(req, res, next);
});


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register', { title: "Register", loggedIn: loggedIn, messages: req.flash('error')});
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const data = req.body;
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = new Account({
            name: data.name,
            email: data.email,
            password: hashedPassword,
        });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate key error
            return res.render('register', {
                title: "Register",
                loggedIn: false,
                messages: ['This email address is already taken.']
            });
        }
        return res.render('register', {
            title: "Register",
            loggedIn: false,
            messages: ['An error occurred during registration. Please try again.']
        });
    }
});



app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) { return next(err); }
        req.session.destroy((err) => {
            if (err) return next(err);
            loggedIn = false; // Reset loggedIn status on logout
            res.redirect('/login');
        });
    });
});


app.get('/logout', (req, res) => {
    console.log("log out")
    loggedIn = false;
    res.redirect('/'); // Redirect to login page
});

app.get("/bookOnline",(req,res)=>{
    res.render('searchFlight', {title:"Search Flight",loggedIn:loggedIn
});
    
app.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('dashboard', { title: "Dashboard", loggedIn: loggedIn });
    });
});

app.get('/contactUs', (req, res) => {
    res.render('contactUs', { title: "Contact Us", form_submitted: false, loggedIn: loggedIn });
});

app.get('/about', (req, res) => {
    res.render('about', { title: "About Us", loggedIn: loggedIn });
});

app.get('/myAccount', checkAuthenticated, (req, res) => {
    res.render('myAccount', { title: "My Account", loggedIn: loggedIn });
});

//app.get('/myBookings', async (req,res)=>{
//     let flights = []
//     if(username){
//         flights = await Service.find({username:username});
//     }
//     res.render('myBookings',{title:"My Bookings",loggedIn: loggedIn,flights:flights})
// })

app.get('/myBookings', (req, res) => {
    res.render('myBookings',{title:"My Bookings",loggedIn: loggedIn})
})

app.get('/myFlightServices',(req,res)=>{
    res.render('myService',{title:"My Flight Services",loggedIn: loggedIn})
})

app.post('/submit_inquiry',(req,res)=>{
    res.render('successContact',{title:"Inform",loggedIn:loggedIn})});


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
        const foodPrice = data.food;
        let food = "";
        if(foodPrice==0){
            food = "No";
        }else if(foodPrice == "10"){
            food = "Chicken Rice + Free Drink";
        }else{
            food = "Singapore Noodle + Free Drink"
        }
        req.session.servicePrice = data.totalFee;
        const service = await Service.create(
            {"passengerPassport":passengerPassport,
            "flightNo":departureFlightNo,
            "seat": data.seat,
            "baggage": data.baggage,
            "priority": data.priority,
            "insurance": data.insurance,
            "food": food,
            "flightClass": req.session.departureFlightClass
        });
        if(req.session.returnFlightNo){
            const service = await Service.create(
                {"passengerPassport":passengerPassport,
                "flightNo":req.session.returnFlightNo,
                "seat": data.seat,
                "baggage": data.baggage,
                "priority": data.priority,
                "insurance": data.insurance,
                "food": food,
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

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        loggedIn = true;
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        loggedIn = true;
        return res.redirect('/');
    }
    next();
}