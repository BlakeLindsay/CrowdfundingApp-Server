const router = require('express').Router();
const Donation = require('../models/donation.model.js');
const User = require('../models/user.model.js');
const Campaign = require("../models/campaign.model");
const validateSession = require('../middleware/validateSession');

router.post('/', async (req, res) => {
	try {
		let {amount, message, donationName, userID, campaignId} = req.body;
		amount = parseInt(amount);
		console.log({amount, typeof: typeof amount})
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

		console.log({campaign, amount})

		let fundRaised = campaign.fundRaised;
		fundRaised = parseInt(fundRaised);
		fundRaised += amount;

		const editedCampaign = await Campaign.findByIdAndUpdate(campaignId, { fundRaised }, {new: true});

		console.log({editedCampaign});

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