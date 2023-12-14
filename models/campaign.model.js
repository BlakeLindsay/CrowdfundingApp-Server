const mongoose = require('mongoose');
// const Donation = require('../models/donation.model.js');

const CampaignSchema = new mongoose.Schema({
  campaignName: {
    type: String,
    required: true,
  },
  fundGoal: {
    type: Number,
    required: true,
  },
  fundRaised: {
    type: Number,
    
  },
  campaignType: {
    type: String,
    required: true,
  },
  shortDesc: {
    type: String,
    required: true,
  },
  detailDesc: {
    type: String,
    required: true,
  },
    campaignImageLink: {
    type: String,
    required: true,
  }, 
  owner: {
    type: String,
    required: true
  },
  ownerID: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
	// donations: {
	// 	type: [Donation],
	// 	default: undefined
	// }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
