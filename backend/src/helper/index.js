import axios from "axios";

let paypal = {
	token: null,
	expires_in: null,
};

export const generateAccessToken = async () => {
	try {
		if (paypal?.token && Date.now() < paypal?.expires_in) {
			return paypal?.token;
		}
		let auth = Buffer.from(
			`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
		).toString("base64");
		const response = await axios.post(
			process.env.PAYPAL_BASE_URL + "/v1/oauth2/token",
			"grant_type=client_credentials",
			{
				headers: {
					Authorization: `Basic ${auth}`,
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		);

		const { access_token, expires_in } = response.data || {};
		paypal = {
			token: access_token,
			expires_in: Date.now() + (expires_in - 60) * 1000,
		};

		return access_token;
	} catch (error) {
		console.log("error==>generateAccessToken", error);
		throw error;
	}
};
