const router = require("express").Router();
const Campaign = require("../models/campaign.model");
const validateSession = require("../middleware/validateSession");
const uploadURL = require("../s3.js");

router.post("/create", validateSession, async function (req, res) {
  try {
    const {
      campaignName,
      fundGoal,
      campaignType,
      shortDesc,
      detailDesc,
      campaignImageLink,
    } = req.body;
    // saving user
    const owner = req.user.userName;

    // Save campaign to the database
    const newCampaign = new Campaign({
      campaignName,
      fundGoal,
      campaignType,
      shortDesc,
      detailDesc,
      campaignImageLink,
      owner,
    });
    //save new campaign
    const madeCampaign = await newCampaign.save();
    // Return a success response
    return res
      .status(200)
      .json({ madeCampaign, message: "Campaign created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:campaignId", async function (req, res) {
  try {
    const campaignId = req.params.campaignId;

    //save new campaign
    const campaign = await Campaign.findById(campaignId);

    // Return a success response
    return res.status(200).json({ campaign });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
//! Campaign Picture Link

router.get("/campaignimage/makeurl", validateSession, async (req, res) => {
  try {
    const url = await uploadURL();

    res.status(200).json({
      url,
    });
  } catch (error) {
    res.status(500).json({
      ERROR: error.message,
    });
  }
});

router.get("/campaignimage/geturl", validateSession, async (req, res) => {
  try {
    const campaignId = req.campaign._id;
    const campaign = await Campaign.findById(campaignId);

    res.status(200).json({
      url: campaign.campaignImageLink,
    });
  } catch (error) {
    res.status(500).json({
      ERROR: error.message,
    });
  }
});

router.post("/campaignimage/saveurl", validateSession, async (req, res) => {
  try {
    const { url } = req.body;
    const campaignId = req.campaign._id;
    const editedCampaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { campaignImageLink: url },
      { new: true }
    );

    res.status(200).json({
      editedCampaign,
      url,
    });
  } catch (error) {
    res.status(500).json({
      ERROR: error.message,
    });
  }
});

module.exports = router;
