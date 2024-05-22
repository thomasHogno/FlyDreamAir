const mongoose = require("mongoose");

const ServiceSchema = mongoose.Schema({
    passengerPassport: {
    type: String,
},

flightNo: {
    type: String,
},

seat: {
    type: String,
},

baggage: {
    type: String,
},

priority: {
    type: Boolean,
    default: false
},

insurance: {
    type: Boolean,
    default: false,
},
flightClass:{
    type: String,
    default: "economy"
},
food:{
    type: String,
    default: "none",
}
},
{
    timestamps: true,
}
);

const Service = mongoose.model("Service", ServiceSchema);

module.exports = Service;