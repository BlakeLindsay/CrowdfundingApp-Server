const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	userName: {
		type: String, 
		required: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	isAdmin: {
		type: Boolean,
		default: false
	},
	canMakeCampaign: {
		type: Boolean,
		default: false
	},
	profileImageLink: {
		type: String
	}
});

module.exports = mongoose.model('User', UserSchema);