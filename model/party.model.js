const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
    partyname: String,
    partyrefno: String,
});

const Party = mongoose.model('Party', partySchema);

module.exports = Party;
