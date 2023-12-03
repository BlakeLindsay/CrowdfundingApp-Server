const router = require('express').Router();

router.get("/getaccesstoken", async (req, res) => {
	try {
		const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
			headers: new Headers({
				'Authorization': 'Basic ' + btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`)
			}),
			method: 'POST',
			body: new URLSearchParams({
				'grant_type': 'client_credentials'
			})
		});
		const results = await response.json();
		const accessToken = results.access_token;
		console.log(accessToken);
		return res.status(200).json({ accessToken });
	} catch (error) {
		res.status(500).json({
			ERROR: error.message
		})
	}
});

module.exports = router;