const mongoose = require('mongoose');

const consignmentSchema = new mongoose.Schema({
	itemname: String,
	itemquantity: Number,
	itemhsn: Number,
	itemprice: Number,
	itemtaxrate: Number,
	itemdesc: String,
});

const Consignment = mongoose.model('Consignment', consignmentSchema);

module.exports = Consignment;
