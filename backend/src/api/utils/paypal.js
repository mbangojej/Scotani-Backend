const axios = require('axios')
const { paypalClientId, paypalSecretKey } = require('../../config/vars')
const baseUrl = "https://api.paypal.com"
const getAccessToken = async () => {
    const qs = require('qs');
    let data = qs.stringify({
        'grant_type': 'client_credentials'
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        auth: {
            username: paypalClientId,
            password: paypalSecretKey
        },
        url: `${baseUrl}/v1/oauth2/token`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data
    };

    let response = await axios.request(config)
    return response.data.access_token
}
const generatePayPalRequestId = () => {
    // Get the current timestamp in milliseconds
    const timestamp = new Date().getTime();
    // Generate a random number (between 0 and 999) to add uniqueness
    const random = Math.floor(Math.random() * 1000);
    // Combine the timestamp and random number to create the PayPal-Request-Id
    const requestId = `${timestamp}${random}`;
    return requestId;
}
const getOrderDetails = async (orderId) => {
    let accessToken = await getAccessToken()
    let config = {
        method: 'get',
        url: `${baseUrl}/v2/checkout/orders/${orderId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    };
    let response = await axios.request(config)
    return response.data.purchase_units[0].payments.captures[0].id
}
exports.makePaypalRefund = async (orderId, amount = 0) => {
    try {
        let data = {
            "amount": {
                "value": amount,
                "currency_code": "USD"
            },
            "invoice_id": "INVOICE-123",
            "note_to_payer": "Refund Request Scootani",
        }
        let captureId = await getOrderDetails(orderId)
        let accessToken = await getAccessToken()
        let config = {
            method: 'post',
            url: `${baseUrl}/v2/payments/captures/${captureId}/refund`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Prefer': 'return=representation'
            },
            data: JSON.stringify(data)
        };

        let response = await axios.request(config)
    } catch (e) {
        console.log("🚀 ~ file: stripe.js:34 ~ exports.makeRefund= ~ e:", e)
    }
}
