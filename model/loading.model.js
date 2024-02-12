const mongoose = require('mongoose');

const loadingSchema = new mongoose.Schema({
	startstate: String,
	endstate: String,
	// rate : Number,
});

const Loading = mongoose.model('Loading', loadingSchema);

module.exports = Loading;
