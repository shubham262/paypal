import { seedPlans, seedProducts } from "../constants/index.js";
import { generateAccessToken } from "../helper/index.js";
import db from "../models/index.js";
import axios from "axios";
const { Product, Order, Plan, Subscription } = db;

export const seedProductsController = async (req, res) => {
	try {
		await Product.deleteMany({});

		const seededProducts = await Product.insertMany(seedProducts);

		return res.status(201).json({
			success: true,
			message: "Database successfully seeded with PW curriculum.",
			count: seededProducts.length,
			data: seededProducts,
		});
	} catch (error) {
		console.error("[seedProductsController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to seed products",
			details: error.message,
		});
	}
};
export const fetchAllProductsController = async (req, res) => {
	try {
		const products = await Product.find();
		return res.status(201).json({
			success: true,
			message: "Fetch all products successfully",
			products,
		});
	} catch (error) {
		console.error("[fetchAllProductsController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to fetch products",
			details: error.message,
		});
	}
};

export const createPayPalCheckoutSessionController = async (req, res) => {
	try {
		const userId = req.user.id;
		const { items = [] } = req.body || {};

		if (!items || items.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Need valid items array",
			});
		}

		const orderSnapShot = [];
		let totalAmountInCents = 0;

		// 1. Validate items and accumulate total cost
		for (const item of items) {
			const product = await Product.findById(item?._id);
			if (!product || !product.active) {
				return res.status(404).json({
					success: false,
					message: `Product with ID ${item?._id} does not exist or is inactive`,
				});
			}

			totalAmountInCents += product.price || 0;

			orderSnapShot.push({
				productId: product._id,
				name: product.name,
				slug: product.slug,
				quantity: 1,
				unitAmount: product.price,
				lineTotal: product.price,
				currency: product.currency.toUpperCase(),
			});
		}
		const stringDecimalTotal = (totalAmountInCents / 100).toFixed(2);
		// 2. Fetch the dynamic OAuth2 token
		const accessToken = await generateAccessToken();

		// 3. Create the order using Axios
		const payload = {
			intent: "CAPTURE",
			purchase_units: [
				{
					reference_id: `receipt_${userId}_${Date.now()}`,
					amount: {
						currency_code: "USD",
						value: stringDecimalTotal,
					},
				},
			],
			application_context: {
				return_url: `http://localhost:3000/dashboard/success`, // ✅ PayPal will auto-append ?token=YOUR_ORDER_ID
				cancel_url: `http://localhost:3000/dashboard/ecommerce`,
				user_action: "PAY_NOW",
			},
		};

		const paypalResponse = await axios.post(
			`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
			payload,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		const paypalOrder = paypalResponse.data;

		const order = await Order.create({
			userId,
			items: orderSnapShot,
			subtotalAmount: totalAmountInCents,
			totalAmount: totalAmountInCents,
			currency: "usd",
			status: "pending",
			paypalOrderId: paypalOrder.id,
		});

		// 5. Extract the redirect target URL
		const approvalUrlLink = paypalOrder.links.find(
			(link) => link.rel === "approve"
		).href;

		// 6. Send the secure URL back to Next.js
		return res.status(201).json({
			success: true,
			message: "PayPal Order created successfully",
			orderId: order._id,
			paypalOrderId: paypalOrder.id,
			url: approvalUrlLink,
		});
	} catch (error) {
		// Better error logging with Axios
		console.error(
			"[createPayPalCheckoutSessionController] Critical Error:",
			error?.response?.data || error.message
		);

		return res.status(500).json({
			success: false,
			error: "Failed to create checkout",
			details: error?.response?.data || error.message,
		});
	}
};

export const capturePayPalOrderController = async (req, res) => {
	try {
		const { orderId } = req.body;

		if (!orderId) {
			return res.status(400).json({
				success: false,
				message: "Order ID (token) is required to capture payment.",
			});
		}

		const accessToken = await generateAccessToken();

		const response = await axios.post(
			`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
			{}, // PayPal requires an empty body for this specific request
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		const captureData = response.data;

		// 3. If PayPal successfully moves the money, update MongoDB
		if (captureData.status === "COMPLETED") {
			const updatedOrder = await Order.findOneAndUpdate(
				{ paypalOrderId: orderId },
				{
					$set: {
						status: "paid",
						paypalOrderStatus: captureData.status,
						paidAt: new Date(),
					},
				},
				{ new: true }
			);

			return res.status(200).json({
				success: true,
				message: "Payment successfully captured!",
				order: updatedOrder,
			});
		} else {
			return res.status(400).json({
				success: false,
				error: "Payment capture was not completed.",
				details: captureData,
			});
		}
	} catch (error) {
		console.error(
			"[capturePayPalOrderController] Critical Error:",
			error?.response?.data || error.message
		);
		return res.status(500).json({
			success: false,
			error: "Failed to capture payment",
			details: error?.response?.data || error.message,
		});
	}
};

export const paypalWebhookController = async (req, res) => {
	try {
		// 1. Generate an access token to talk to PayPal
		const accessToken = await generateAccessToken();

		// 2. PayPal requires us to ask their server: "Did you actually send this?"
		const verifyResponse = await axios.post(
			`${process.env.PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
			{
				transmission_id: req.headers["paypal-transmission-id"],
				transmission_time: req.headers["paypal-transmission-time"],
				cert_url: req.headers["paypal-cert-url"],
				auth_algo: req.headers["paypal-auth-algo"],
				transmission_sig: req.headers["paypal-transmission-sig"],
				webhook_id: process.env.PAYPAL_WEBHOOK_ID,
				webhook_event: req.body, // Pass the exact body PayPal sent us
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		// If PayPal says it's fake, reject it immediately
		if (verifyResponse.data.verification_status !== "SUCCESS") {
			console.error("⚠️ Webhook Signature Verification Failed");
			return res.status(400).send("Unauthorized Webhook Request");
		}

		// 3. Process the verified event
		const event = req.body;

		switch (event.event_type) {
			// ==========================================
			// THE USER APPROVED THE PAYMENT, BUT FUNDS ARE NOT CAPTURED YET
			// ==========================================
			case "CHECKOUT.ORDER.APPROVED": {
				const paypalOrderId = event.resource.id;

				// 🛡️ RACE CONDITION CHECK: Did the Next.js frontend already capture this?
				const order = await Order.findOne({ paypalOrderId });

				if (order && order.status === "pending") {
					console.log(`⏱️ Webhook catching uncaptured order: ${paypalOrderId}`);

					try {
						// The frontend didn't do it, so the Webhook will capture the funds!
						const captureResponse = await axios.post(
							`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
							{},
							{
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${accessToken}`,
								},
							}
						);

						const captureData = captureResponse.data;

						if (captureData.status === "COMPLETED") {
							await Order.findOneAndUpdate(
								{ paypalOrderId },
								{
									$set: {
										status: "paid",
										paypalOrderStatus: captureData.status,
										paidAt: new Date(),
									},
								}
							);
							console.log(
								`✅ Webhook successfully captured order ${paypalOrderId}`
							);
						}
					} catch (captureError) {
						// If PayPal says "ORDER_ALREADY_CAPTURED", it just means the frontend beat us by a millisecond. Safe to ignore!
						if (
							captureError?.response?.data?.details?.[0]?.issue ===
							"ORDER_ALREADY_CAPTURED"
						) {
							console.log(
								`ℹ️ Order ${paypalOrderId} was captured by frontend just in time.`
							);
						} else {
							console.error(
								"❌ Webhook Capture Failed:",
								captureError?.response?.data
							);
						}
					}
				}
				break;
			}

			// ==========================================
			// THE FUNDS WERE SUCCESSFULLY CAPTURED (By Frontend OR Webhook)
			// ==========================================
			case "PAYMENT.CAPTURE.COMPLETED": {
				// This is a great place to send a "Thank you for your purchase!" email
				// because you are 100% guaranteed the money is in your account.
				const captureId = event.resource.id;
				console.log(
					`💰 Money is officially in the bank for capture: ${captureId}`
				);
				break;
			}

			// ==========================================
			// PAYMENT WAS REFUNDED FROM PAYPAL DASHBOARD
			// ==========================================
			case "PAYMENT.CAPTURE.REFUNDED": {
				// Update DB so the user loses access to the course
				console.log(`⚠️ Payment refunded. Revoking access.`);
				break;
			}

			default:
				console.log(`ℹ️ Unhandled event type: ${event.event_type}`);
		}

		// 4. Always return 200 OK quickly so PayPal stops retrying the webhook
		res.status(200).send();
	} catch (error) {
		console.error(
			"[Webhook Database/API Error]:",
			error?.response?.data || error.message
		);
		res.status(500).send("Internal Server Error");
	}
};

export const seedPlanController = async (req, res) => {
	try {
		const seededPlans = await Plan.insertMany(seedPlans);

		return res.status(201).json({
			success: true,
			message: "Database successfully seeded with PW curriculum.",
			count: seededPlans.length,
			data: seededPlans,
		});
	} catch (error) {
		console.error("[seedPlanController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to seed products",
			details: error.message,
		});
	}
};
export const fetchAllPlansController = async (req, res) => {
	try {
		const plans = await Plan.find();
		return res.status(201).json({
			success: true,
			message: "Fetch all products successfully",
			plans,
		});
	} catch (error) {
		console.error("[fetchAllPlansController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to fetch products",
			details: error.message,
		});
	}
};

export const createSubscriptionCheckoutController = async (req, res) => {
	try {
		// 1. Extract data from request
		const userId = req.user.id;
		const { planId, interval } = req.body || {};

		if (!planId || !interval) {
			return res.status(400).json({
				success: false,
				message: "Plan ID and interval are required.",
			});
		}

		// 2. Look up the Plan in MongoDB
		const plan = await Plan.findById(planId);
		if (!plan || !plan.active) {
			return res.status(404).json({
				success: false,
				message: "Plan not found or inactive.",
			});
		}

		// 3. Find the correct PayPal Plan ID (P-...) based on the user's choice
		const pricingOption = plan.pricingOptions.find(
			(p) => p.interval === interval
		);

		if (!pricingOption || !pricingOption.paypalPlanId) {
			return res.status(400).json({
				success: false,
				message: `No PayPal plan mapped for ${interval} billing.`,
			});
		}
		const paypalPlanId = pricingOption.paypalPlanId;

		// 4. Generate Token & Hit PayPal Subscriptions API
		const accessToken = await generateAccessToken();

		const response = await axios.post(
			`${process.env.PAYPAL_BASE_URL}/v1/billing/subscriptions`,
			{
				plan_id: paypalPlanId,
				// Application Context tells PayPal where to send the user afterwards
				application_context: {
					return_url: `http://localhost:3000/dashboard/subscription/success`,
					cancel_url: `http://localhost:3000/dashboard/pricing`,
					user_action: "SUBSCRIBE_NOW", // Changes the PayPal button text to "Subscribe"
				},
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);

		const subscriptionData = response.data;

		// PayPal Subscription IDs always start with 'I-' (e.g., I-8X9Y7Z6W...)
		const paypalSubscriptionId = subscriptionData.id;

		// 5. Find the exact URL PayPal generated for the user to log in
		const approveLink = subscriptionData.links.find(
			(link) => link.rel === "approve"
		);

		if (!approveLink) {
			throw new Error("No approval link returned from PayPal API.");
		}

		// 6. Save the PENDING subscription to MongoDB
		// We save it now so our Webhook knows who this belongs to later!
		await Subscription.create({
			userId,
			planId,
			paypalPlanId,
			paypalSubscriptionId,
			status: "APPROVAL_PENDING",
		});

		// 7. Send the URL back to the Next.js frontend!
		return res.status(200).json({
			success: true,
			message: "Subscription session created successfully",
			url: approveLink.href,
			subscriptionId: paypalSubscriptionId,
		});
	} catch (error) {
		console.error(
			"[createSubscriptionCheckoutController] Error:",
			error?.response?.data || error.message
		);
		return res.status(500).json({
			success: false,
			error: "Failed to initialize subscription checkout.",
		});
	}
};
