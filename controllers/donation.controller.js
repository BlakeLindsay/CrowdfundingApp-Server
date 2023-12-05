const router = require('express').Router();

async function getAccessToken() {
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
		return accessToken;
};

router.get("/getaccesstoken", async (req, res) => {
	try {
		const accessToken = await getAccessToken();
		return res.status(200).json({ accessToken });
	} catch (error) {
		res.status(500).json({
			ERROR: error.message
		})
	}
});

router.post('/donate', async (req, res) => {
	try {
		const accessToken = await getAccessToken();
		let order_data_json = {
			'intent': req.body.intent.toUpperCase(),
			'purchase_units': [{
				'amount': {
					'currency_code': 'USD',
					'value': '10.00'
				}
			}]
		};
		const data = JSON.stringify(order_data_json);

		const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
				'PayPal-Request-Id': crypto.randomUUID()
			},
			body: data
		});
		const results = response.json();
		res.status(200).send({id: results.id});
	} catch (error) {
		res.status(500).json({
			ERROR: error.message
		})
	}
});

router.post('complete_donate', async (req, res) => {
	try {
		const accessToken = await getAccessToken();
		const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
			method: 'POST',
			headers: {
				'ContentType': 'application/json',
				'Authorization': `Bearer ${accessToken}`
			}
		});
		const results = response.json();
		res.status(200).send(results);
	} catch (error) {
		res.status(500).json({
			ERROR: error.message
		})
	}
});

module.exports = router;