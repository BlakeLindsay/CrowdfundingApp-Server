const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
	amount: {
		type: Number,
		required: true
	},
	date: {
		type: Date,
		required: true
	},
	name: {
		type: String,
		default: 'Anonymous'
	}
});

module.exports = mongoose.model('Donation', DonationSchema);