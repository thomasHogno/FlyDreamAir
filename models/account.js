const mongoose = require("mongoose");

const AccountSchema = mongoose.Schema({
    name: {
    type: String,
},
    email: {
    type: String,
},
    password: {
    type: String,
}},
{
    timestamps: true,
}
);

const Account = mongoose.model("Account", AccountSchema);

module.exports = Account;