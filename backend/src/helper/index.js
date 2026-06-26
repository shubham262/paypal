import axios from "axios";

export const generateAccessToken = async () => {
	try {
		if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_APP_SECRET) {
			throw new Error("MISSING_API_CREDENTIALS");
		}

		const auth = Buffer.from(
			`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_APP_SECRET}`
		).toString("base64");

		const response = await axios.post(
			`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
			"grant_type=client_credentials", // Body payload
			{
				headers: {
					Authorization: `Basic ${auth}`,
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		);

		return response.data.access_token;
	} catch (error) {
		// Axios errors store the API response details inside error.response.data
		console.error(
			"Failed to generate Access Token:",
			error?.response?.data || error.message
		);
		throw error;
	}
};
