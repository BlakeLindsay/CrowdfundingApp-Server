const router = require('express').Router();
const Campaign = require('../models/campaign.model');
const validateSession = require('../middleware/validateSession');


router.post('/create',validateSession, async function (req, res) {
  try {
    const {
      campaignName,
      fundGoal,
      campaignType,
      shortDesc,
      detailDesc,
    } = req.body;
// saving user
    const owner = req.user._id;

    // Save campaign to the database
    const newCampaign = new Campaign({
      campaignName,
      fundGoal,
      campaignType,
      shortDesc,
      detailDesc,
      owner,
    });
    //save new campaign
    const madeCampaign = await newCampaign.save();

    // Return a success response
    return res.status(200).json({ madeCampaign, message: 'Campaign created successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error'});
  }
});

router.get('/:campaignId', async function (req, res) {
  try {
    const campaignId = req.params.campaignId;

    //save new campaign
    const campaign = await Campaign.findById(campaignId);

    // Return a success response
    return res.status(200).json({ campaign });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error'});
  }
});

module.exports = router;
