const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
	amount: {
		type: Number,
		required: true
	},
	message: {
		type: String,

	},
	date: {
		type: Date,
		required: true
	},
	name: {
		type: String,
		default: 'Anonymous'
	},
	ownerID: {
		type: mongoose.Types.ObjectId,
	},
	campaignId: {
		type: mongoose.Types.ObjectId,
		required: true
	}
});

module.exports = mongoose.model('Donation', DonationSchema);