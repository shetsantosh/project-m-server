const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
	partyname: String,
	partyrefno: String,
	partyrate: Number,
});

const Party = mongoose.model('Party', partySchema);

module.exports = Party;
