import axios from "axios";
import { seedPlans, seedProducts } from "../constants/index.js";
import { generateAccessToken } from "../helper/index.js";
import db from "../models/index.js";

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

export const seedPlanController = async (req, res) => {
	try {
		await Plan.deleteMany({});

		const seededPlans = await Plan.insertMany(seedPlans);

		return res.status(201).json({
			success: true,
			message: "Database successfully seeded with PW curriculum.",
			count: seededPlans.length,
			data: seededPlans,
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
export const fetchAllPlanController = async (req, res) => {
	try {
		const plans = await Plan.find();
		return res.status(201).json({
			success: true,
			message: "Fetch all products successfully",
			plans,
		});
	} catch (error) {
		console.error("[fetchAllPlanController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to fetch plans",
			details: error.message,
		});
	}
};

export const checkoutController = async (req, res) => {
	try {
		const userId = req?.user?.id;
		const { items = [] } = req.body || {};
		if (!items || !items?.length) {
			return res.status(400).json({
				message: "No products received",
			});
		}

		let totalAmount = 0;
		let orderSnapShot = [];
		for (let i = 0; i < items?.length; i++) {
			const product = await Product.findById(items?.[i]?._id);

			if (!product) {
				return res.status(404).json({ message: "Product does not exist" });
			}
			totalAmount += product?.price || 0;

			let orderItem = {
				productId: product?._id,
				name: product?.name,
				slug: product?.slug,
				quantity: 1,
				unitAmount: product?.price,
				lineTotal: product?.price,
				currency: product?.currency,
			};
			orderSnapShot.push(orderItem);
		}

		const amount = (totalAmount / 100).toFixed(2);
		const token = await generateAccessToken();

		const payload = {
			intent: "CAPTURE",
			purchase_units: [
				{
					reference_id: `receipt_${userId}_${Date.now()}`,
					amount: {
						currency_code: "USD",
						value: amount,
					},
				},
			],
			application_context: {
				user_action: "PAY_NOW",
				return_url: "http://localhost:3000/dashboard/success",
				cancel_url: "http://localhost:3000/dashboard/ecommerce",
			},
		};
		const payPalResponse = await axios.post(
			`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
			payload,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		const payPalOrder = payPalResponse?.data;
		const { id, links, status } = payPalOrder;
		let approvedUrl = links?.filter((ele) => ele?.rel === "approve")?.[0]?.href;

		const order = await Order.create({
			userId,
			items: orderSnapShot,
			subtotalAmount: amount,
			totalAmount: amount,
			currency: "usd",
			status: "pending",
			paypalOrderId: id,
			paypalOrderStatus: status,
		});

		return res
			.status(201)
			.json({ message: "Order created", order, url: approvedUrl });
	} catch (error) {
		console.error("[checkoutController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to create checkout",
			details: error.message,
		});
	}
};

export const captureController = async (order_id) => {
	try {
		if (!order_id) {
			return;
		}

		const token = await generateAccessToken();

		const order = await Order.findOne({
			paypalOrderId: order_id,
		});

		if (order.status === "paid") {
			console.log("Order already marked paid");
			return;
		}

		const captureResponse = await axios.post(
			`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${order_id}/capture`,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);
		const capture = captureResponse?.data;
		if (capture.status !== "COMPLETED") {
			console.log("Order not completed", {
				error: capture.status,
				success: false,
			});
			return;
		}

		order.paypalOrderStatus = capture.status;
		order.status = "paid";
		order.paidAt = new Date();
		await order.save();

		console.log("order marked successfully");
	} catch (error) {
		console.error("[captureController] Critical Error:", error);
	}
};

export const paypalWebhookController = async (req, res) => {
	try {
		const token = await generateAccessToken();

		console.log("req.body", req.body, "\n", req.headers);

		const verifyRequest = await axios.post(
			`${process.env.PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
			{
				transmission_id: req.headers["paypal-transmission-id"],
				transmission_time: req.headers["paypal-transmission-time"],
				cert_url: req.headers["paypal-cert-url"],
				auth_algo: req.headers["paypal-auth-algo"],
				transmission_sig: req.headers["paypal-transmission-sig"],
				webhook_id: process.env.PAYPAL_WEBHOOK_ID,
				webhook_event: req.body,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		const verifyData = verifyRequest?.data;

		if (verifyData?.verification_status !== "SUCCESS") {
			return res.status(403).json({
				message: "Unauthorised",
			});
		}

		const event = req.body;

		const eventType = event.event_type;

		switch (eventType) {
			case "CHECKOUT.ORDER.APPROVED":
				captureController(event.resource.id);
				break;

			case "BILLING.SUBSCRIPTION.ACTIVATED": {
				const subscriptionId = event.resource.id;
				const paypalSubscriberId = event.resource?.subscriber?.payer_id;
				const currentPeriodEnd = event?.billing_info?.next_billing_time;

				const subscription = await Subscription.findOne({
					paypalSubscriptionId: subscriptionId,
				});
				if (!subscription) {
					console.log("No such subscription found");
				}

				subscription.paypalSubscriberId = paypalSubscriberId;
				subscription.currentPeriodEnd = new Date(currentPeriodEnd);
				subscription.status = "active";
				await subscription.save();
				console.log("Subscription marked success fully");
			}

			default:
				console.log("Unhandled event", eventType);
				break;
		}

		res.send(200);
	} catch (error) {
		console.error("[paypalWebhookController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to capture webhook events",
			details: error.message,
		});
	}
};

export const orderStatusController = async (req, res) => {
	try {
		const { order_id } = req.params || {};

		if (!order_id) {
			return res.status(400).json({ message: "Order Id Is required" });
		}

		const order = await Order.findOne({
			paypalOrderId: order_id,
		});

		if (!order) {
			return res.status(400).json({ message: "Order does not exist" });
		}
		return res.status(200).json({ order });
	} catch (error) {
		console.error("[orderStatusController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to capture webhook events",
			details: error.message,
		});
	}
};

export const subscriptionStatusController = async (req, res) => {
	try {
		const { subscriptionId } = req.params || {};

		if (!subscriptionId) {
			return res.status(400).json({ message: "Order Id Is required" });
		}

		const subscription = await Subscription.findOne({
			paypalSubscriptionId: subscriptionId,
		});

		if (!subscription) {
			return res.status(400).json({ message: "Order does not exist" });
		}
		return res.status(200).json({ subscription });
	} catch (error) {
		console.error("[subscriptionStatusController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to capture webhook events",
			details: error.message,
		});
	}
};

export const subscriptionController = async (req, res) => {
	try {
		const { planId, interval } = req.body || {};
		const userId = req.user?.id;
		if (!planId || !interval) {
			return res
				.status(400)
				.json({ message: "PlanId and Interval is required" });
		}

		const plan = await Plan.findById(planId);
		if (!plan) {
			return res.status(404).json({ message: "No Such plan exist" });
		}

		const pricingOptions = plan.pricingOptions?.filter(
			(ele) => ele?.interval === interval
		)?.[0];

		const payPalPlanId = pricingOptions?.paypalPlanId;

		console.log("payPalPlanId", payPalPlanId);
		if (!payPalPlanId) {
			return res.status(404).json({ message: "No Such plan exist" });
		}

		const accessToken = await generateAccessToken();
		const subscriptionResponse = await axios.post(
			`${process.env.PAYPAL_BASE_URL}/v1/billing/subscriptions`,
			{
				plan_id: payPalPlanId,
				application_context: {
					user_action: "SUBSCRIBE_NOW",
					return_url: "http://localhost:3000/dashboard/subscriptions/success",
					cancel_url: "http://localhost:3000/dashboard/subscriptions",
				},
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);

		const subscriptionId = subscriptionResponse?.data?.id;
		const subscription = await Subscription.create({
			userId,
			planId,

			paypalPlanId: payPalPlanId,
			paypalSubscriptionId: subscriptionId,

			status: "APPROVAL_PENDING",
		});

		const { links } = subscriptionResponse?.data || {};

		const url = links.filter((ele) => ele?.rel === "approve")?.[0]?.href;
		return res.status(201).json({
			message: "Subscription created",
			url,
			subscription,
		});
	} catch (error) {
		console.error("[subscriptionController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to capture webhook events",
			details: error.message,
		});
	}
};
