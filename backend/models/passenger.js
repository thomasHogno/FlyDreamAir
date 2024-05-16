const mongoose = require("mongoose");

const PassengerSchema = mongoose.Schema({
givenName: {
    type: String,
    required: [true,"Please enter your given name"],
},

surname: {
    type: String,
    required: [true,"Please enter your surname"],
},

phone: {
    type: String,
    required: [true,"Please enter your phone number"],
},

address: {
    type: String,
    required: [true,"Please enter your address"],
},

postcode: {
    type: String,
    required: [true,"Please enter your postcode"],
},

memberNumber: {
    type: String,
    required: [true,"Please enter your member number"],
},

passport: {
    type: String,
    required: [true,"Please enter your passport"],
},

issuingCountry: {
    type: String,
    required: [true,"Please enter your issuing country"],
},

expDate: {
    type: String,
    required: [true,"Please enter your expiration date"],
},

flights: {
    type: [],
    default: [],
},

seat: {
    type: String,
    default: -1,
},

baggage: {
    type: Number,
    default: 0,
},

priority: {
    type: Boolean,
    default: false,
},

insurance: {
    type: Boolean,
    default: false,
},
},
{
    timestamps: true,
}
);

const Passenger = mongoose.model("Passenger", PassengerSchema);

module.exports = Passenger;