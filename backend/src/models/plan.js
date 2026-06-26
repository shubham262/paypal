import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, required: true },

		// 🆕 ADDED: The parent PayPal Product ID (e.g., PROD-12345)
		paypalProductId: { type: String, required: true, unique: true },

		features: [{ type: String }],
		active: { type: Boolean, default: true },

		pricingOptions: [
			{
				interval: {
					type: String,
					enum: ["month", "year"],
					required: true,
				},
				price: {
					type: Number,
					required: true,
				},
				currency: { type: String, default: "usd" }, // 🔄 Changed default to USD

				// 🔄 REPLACED: Swapped Razorpay for PayPal
				paypalPlanId: {
					type: String,
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
