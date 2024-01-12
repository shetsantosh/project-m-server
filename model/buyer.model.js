const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
    //buyerid: String,
    buyercompanyname: String,
    buyercompanygstno: String,
    buyercompanyaddress: String,
    buyercompanystatename: String,
    buyercompanystatecode: String,
});

const Buyer = mongoose.model('Buyer', buyerSchema);

module.exports = Buyer;
