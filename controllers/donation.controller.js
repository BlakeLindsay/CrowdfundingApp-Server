const router = require('express').Router();

router.get("/getaccesstoken", async (req, res) => {
	try {
		const accessToken = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
			headers: new Headers({
				'Content-Type': 'application/x-www-form-urlencoded'
			}),
			method: 'POST'
		});
	} catch (error) {
		res.status(500).json({
			ERROR: error.message
		})
	}
});

module.exports = router;