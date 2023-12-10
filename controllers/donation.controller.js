const router = require('express').Router();
const Donation = require('../models/donation.model.js');
const User = require('../models/user.model.js');
const Campaign = require("../models/campaign.model");
const validateSession = require('../middleware/validateSession');

router.post('/', async (req, res) => {
	try {
		const {amount, message, donationName, userID, campaignId} = req.body;
		let donation = {amount, message, name: donationName, campaignId};
		donation.date = Date();

		const user = await User.findById(userID);
		if (user) {
			donation.ownerID = userID;
			donation.name = user.userName;
		}

		const newDonation = new Donation(donation);

		const returnedDonation = await newDonation.save();
		
		const campaign = await Campaign.findById(campaignId);

		let fundRaised = campaign.fundRaised;
		fundRaised += amount;

		const editedCampaign = await Campaign.findByIdAndUpdate(campaignId, { fundRaised }, {new: true});

		res.status(200).json({
			donation: returnedDonation,
			editedCampaign,
			message: 'donation successful',
		});

	} catch (error) {
		res.status(500).json({
			ERROR: error.message
		});
	}
});

module.exports = router;