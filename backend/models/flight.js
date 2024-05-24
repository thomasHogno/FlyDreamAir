const { Double } = require("mongodb");
const mongoose = require("mongoose");

const FlightSchema = mongoose.Schema({
    departureCity: {
    type: String,
},

destinationCity: {
    type: String,
},

departureTime: {
    type: String,
},

flightNo: {
    type: String,
},

duration: {
    type: Number,
},

price: {
    type: Number,
}},
{
    timestamps: true,
}
);

const Flight = mongoose.model("Flight", FlightSchema);

module.exports = Flight;