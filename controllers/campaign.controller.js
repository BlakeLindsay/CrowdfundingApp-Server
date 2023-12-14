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
      ownerID: req.user._id,
			fundRaised: 0
    });
    //save new campaign
    const madeCampaign = await newCampaign.save();
    // Return a success response with loggedInUser information
    return res.status(200).json({
      madeCampaign,
      loggedInUser: res.locals.loggedInUser,
      message: "Campaign created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//! Get All Campaign
router.get("/getall", async (req, res) => {
  try {

    // console.log("Received searchTerm:", searchTerm);
    // console.log("Received campaignType:", campaignType);
    // Use MongoDB queries to filter campaigns based on the search term and type
    const campaigns = await Campaign.find({
      // $or: [
      //   { campaignName: { $regex: new RegExp(searchTerm, "i") } },
      //   { campaignType: { $regex: new RegExp(campaignType, "i") } },
      // ],
			// campaignType
    });

    if (campaigns.length > 0) {
      res.status(200).json({ campaigns });
    } else {
      res.status(400).json({ message: "No Campaigns Found" });
    }
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/search/name/:name", async (req, res) => {
  try {
		const name = req.params.name;

		const query = { $text: { $search: `${name}` } };

    const campaigns = await Campaign.find(query);

    if (campaigns.length > 0) {
      res.status(200).json({ campaigns });
    } else {
      res.status(400).json({ message: "No Campaigns Found" });
    }
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/search/category/:category", async (req, res) => {
  try {
		const campaignType = req.params.category;

    const campaigns = await Campaign.find({
      campaignType
    });

    if (campaigns.length > 0) {
      res.status(200).json({ campaigns });
    } else {
      res.status(400).json({ message: "No Campaigns Found" });
    }
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    res.status(500).json({ message: "Internal Server Error" });
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
    const campaignId = req.body.campaign._id;
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

router.delete(
  "/delete/:campaignId",
  validateSession,
  async function (req, res) {
    try {
      const campaignId = req.params.campaignId;
      // Delete the campaign
      await Campaign.findByIdAndDelete(campaignId);

      return res.status(200).json({ message: "Campaign deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.delete(
  "/deletebyname/:campaignName",
  validateSession,
  async function (req, res) {
    try {
     
      const campaignName = req.params.campaignName;
      console.log("Deleting campaign by name:", campaignName);
      
      // Delete the campaign by name
      const result = await Campaign.findOneAndDelete({ campaignName: campaignName });

      if (!result) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      return res.status(200).json({ message: "Campaign deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.put("/update/:campaignId", validateSession, async function (req, res) {
  try {
    const campaignId = req.params.campaignId;
    const updateData = req.body;

    // Fetch the campaign by ID
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Update campaign fields
    campaign.campaignName = updateData.campaignName || campaign.campaignName;
    campaign.fundGoal = updateData.fundGoal || campaign.fundGoal;
    campaign.campaignType = updateData.campaignType || campaign.campaignType;
    campaign.shortDesc = updateData.shortDesc || campaign.shortDesc;
    campaign.detailDesc = updateData.detailDesc || campaign.detailDesc;
    campaign.campaignImageLink =
      updateData.campaignImageLink || campaign.campaignImageLink;

    // Save the updated campaign
    const updatedCampaign = await campaign.save();

    return res
      .status(200)
      .json({ updatedCampaign, message: "Campaign updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
