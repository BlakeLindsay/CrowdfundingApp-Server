const router = require('express').Router();
const bodyParser = require('body-parser');
const Campaign = require('../models/campaign.model');
const validateSession = require('../middleware/validateSession');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

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

    await newCampaign.save();

    // Return a success response
    return res.status(200).json({ message: 'Campaign created successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});




module.exports = router;
