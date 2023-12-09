const crypto = require("crypto");
const router = require('express').Router();

// let accessToken;

// async function getAccessToken() {
// 	const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
// 			headers: new Headers({
// 				'Authorization': 'Basic ' + btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`)
// 			}),
// 			method: 'POST',
// 			body: new URLSearchParams({
// 				'grant_type': 'client_credentials'
// 			})
// 		});
// 		const results = await response.json();
// 		// const accessToken = results.access_token;
// 		accessToken = results.access_token;
// 		// console.log({accessToken});
// 		return accessToken;
// };

// router.get("/getaccesstoken", async (req, res) => {
// 	try {
// 		const accessToken = await getAccessToken();
// 		return res.status(200).json({ accessToken });
// 	} catch (error) {
// 		res.status(500).json({
// 			ERROR: error.message
// 		})
// 	}
// });

// router.post('/donate', async (req, res) => {
// 	try {
// 		accessToken = await getAccessToken();
// 		console.log(accessToken);
// 		// console.log(req.body.intent);
// 		let order_data_json = {
// 			// 'intent': req.body.intent.toUpperCase(),
// 			'intent': "CAPTURE",
// 			'purchase_units': [{
// 				'amount': {
// 					'currency_code': 'USD',
// 					'value': '10.00'
// 				},
// 				'items': [
// 					{
// 						'name': "test",
// 						'quantity': 1,
// 						'category': 'DONATION',
// 						'unit_amount': {
// 							'currency_code': "USD",
// 							'value': '10.00'
// 						}
// 					}
// 				]
// 			}
// 		]
// 		};
// 		const data = JSON.stringify(order_data_json);

// 		const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json',
// 				'Authorization': `Bearer ${accessToken}`,
// 				'PayPal-Request-Id': crypto.randomUUID()
// 			},
// 			body: data
// 		});
// 		const results = await response.json();
// 		console.log(results);
// 		res.status(200).json({id: results.id});
// 	} catch (error) {
// 		res.status(500).json({
// 			ERROR: error.message
// 		})
// 	}
// });

// router.post('/:id', async (req, res) => {
// 	try {
// 		const id = req.params.id;
// 		await getAccessToken();
// 		console.log({accessToken, id});
// 		// const accessToken = req.body.facilitatorToken;
// 		const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${id}/capture`, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json',
// 				'Authorization': `Bearer ${accessToken}`
// 				// 'Authorization': `Basic ${btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`)}`
// 			}
// 		});
// 		const results = await response.json();
// 		console.log(results);
// 		res.status(200).send(results);
// 	} catch (error) {
// 		console.log(error);
// 		res.status(500).json({
// 			ERROR: error.message
// 		})
// 	}
// });

////////////////////////////////////////////////////////////////////////////

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET} = process.env;
const base = "https://api-m.sandbox.paypal.com";

const USDollar = new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2})

/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 * @see https://developer.paypal.com/api/rest/authentication/
 */
const generateAccessToken = async () => {
	// console.log(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
    ).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
		// console.log({data});
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (amount, merchantID) => {
  // use the cart information passed from the front-end to calculate the purchase unit details
  console.log(
    "amount: ", USDollar.format(amount)
  );

  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders`;
  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        items: [
          {
            name: "Donation to Kitty's House",
            description:
              "All proceeds directly support Kitty's House Cat Rescue. Thank you.",
            quantity: "1",
            unit_amount: {
              currency_code: "USD",
              value: USDollar.format(amount),
            },
            category: "DONATION",
          },
        ],
        amount: {
          currency_code: "USD",
          value: USDollar.format(amount),
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: USDollar.format(amount),
            },
          },
        },
      },
    ],
		payee: {
			email_address: "sb-1ziaa28477586@business.example.com",
			merchant_id: "32MA2T4NYJRRY"
		}
  };
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
      // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

const captureOrder = async (orderID) => {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderID}/capture`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
      // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
		body: {
			payment_source: {
				paypal: {
					email_address: "sb-x1evn28477614@personal.example.com"
				}
			}
		}
  });

  return handleResponse(response);
};

async function handleResponse(response) {
  try {
    const jsonResponse = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

router.post("/order", async (req, res) => {
  try {
    // use the cart information passed from the front-end to calculate the order amount details
    const { amount, merchantID } = req.body;
    const { jsonResponse, httpStatusCode } = await createOrder(amount, merchantID);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
});

router.post("/order/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
		console.log(jsonResponse);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
});

module.exports = router;