const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
   // sellerid: String,
    sellercompanyname: String,
    sellercompanygstno: String,
    sellercompanyaddress: String,
    sellercompanystatename: String,
    sellercompanystatecode: String,
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
