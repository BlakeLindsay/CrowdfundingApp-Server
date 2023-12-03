const mongoose = require('mongoose');

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
  /* pic: {
    type: ,
  required: false,
  }, */
  owner: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
