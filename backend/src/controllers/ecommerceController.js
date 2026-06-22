import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import { seedPlans, seedProducts } from "../constants/index.js";
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

export const createCheckoutSessionController = async (req, res) => {
	try {
		const userId = req.user.id;
		const { items = [] } = req.body || {};
		if (!items || items.length === 0) {
			return res.status(500).json({
				message: "Need valid items array",
			});
		}

		const orderSnapShot = [];
		let amountInPaise = 0;

		for (const item of items) {
			const product = await Product.findById(item?._id);
			if (!product) {
				return res.status(500).json({
					message: "Product does not exist",
				});
			}

			amountInPaise += product.price || 0;

			orderSnapShot.push({
				productId: product?._id,
				name: product?.name,
				slug: product?.slug,
				quantity: 1,
				unitAmount: product.price,
				lineTotal: product.price,
				currency: product.currency,
			});
		}

		// create razorpay order

		var options = {
			amount: amountInPaise,
			currency: "INR",
			receipt: `receipt_${userId}`,
		};

		const razorpayOrder = await razorpay.orders.create(options);

		const order = await Order.create({
			userId,
			items: orderSnapShot,
			subtotalAmount: amountInPaise,
			totalAmount: amountInPaise,
			currency: "inr",

			status: "pending",

			razorpayOrderId: razorpayOrder?.id,
		});

		return res.status(201).json({
			message: "Order created",
			order,
			amount: amountInPaise,
			currency: "INR",
			razorpayOrderId: razorpayOrder?.id,
		});
	} catch (error) {
		console.error("[createCheckoutSessionController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to create checkout",
			details: error.message,
		});
	}
};

export const verifyPayment = async (req, res) => {
	try {
		const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
			req.body || {};

		if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
			return res.status(400).json({
				success: false,
				message: "Request is missing mandatory payload",
			});
		}

		const data = razorpay_order_id + "|" + razorpay_payment_id;
		const signature = crypto
			.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
			.update(data.toString())
			.digest("hex");

		const isAuthentic = signature === razorpay_signature;

		if (!isAuthentic) {
			return res.status(400).json({
				success: false,
				message: "Unauthorsied",
			});
		}

		const order = await Order.findOne({
			razorpayOrderId: razorpay_order_id,
		});

		if (order.status === "paid") {
			return res.status(400).json({
				success: false,
				message: "Order was already marked as paid",
			});
		}

		order.status = "paid";
		order.razorpayPaymentId = razorpay_payment_id;
		order.razorpaySignature = razorpay_signature;
		order.paidAt = new Date();
		order.save();

		return res.status(201).json({
			success: true,
		});
	} catch (error) {
		console.error("[verifyPayment] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to verify payment",
			details: error.message,
		});
	}
};

export const verifySubscription = async (req, res) => {
	try {
		const {
			razorpay_payment_id,
			razorpay_subscription_id,
			razorpay_signature,
		} = req.body || {};

		if (
			!razorpay_payment_id ||
			!razorpay_subscription_id ||
			!razorpay_signature
		) {
			return res.status(400).json({
				success: false,
				message: "Request is missing mandatory payload",
			});
		}

		const data = razorpay_payment_id + "|" + razorpay_subscription_id;
		const signature = crypto
			.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
			.update(data.toString())
			.digest("hex");

		const isAuthentic = signature === razorpay_signature;

		if (!isAuthentic) {
			return res.status(400).json({
				success: false,
				message: "Unauthorsied",
			});
		}

		const subscription = await Subscription.findOne({
			razorpaySubscriptionId: razorpay_subscription_id,
		});

		if (!subscription) {
			return res.status(400).json({
				success: false,
				message: "subscription not found",
			});
		}

		if (subscription.status === "active") {
			return res.status(400).json({
				success: false,
				message: "subscription already marked as active",
			});
		}

		subscription.status === "active";
		await subscription.save();

		return res.status(201).json({
			success: true,
		});
	} catch (error) {
		console.error("[verifyPayment] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to verify payment",
			details: error.message,
		});
	}
};

export const subscriptionController = async (req, res) => {
	try {
		const userId = req.user.id;
		const { planId, interval } = req.body || {};
		if (!planId || !interval) {
			return res.status(400).json({
				message: "PlanId and interval is required",
			});
		}

		const plan = await Plan.findById(planId);
		if (!plan || !plan.active) {
			return res.status(400).json({
				message: "Invalid plan",
			});
		}

		const options = plan?.pricingOptions;
		const requiredPlan = options.find((a) => a?.interval === interval);

		const razorpayOptions = {
			plan_id: requiredPlan?.razorpayPlanId,
			total_count: interval === "month" ? 120 : 10,
			quantity: 1,
			customer_notify: true,
		};

		const razorPaySubscription = await razorpay.subscriptions.create(
			razorpayOptions
		);
		const subscription = await Subscription.create({
			userId,
			planId: plan?._id,
			razorpayPlanId: requiredPlan?.razorpayPlanId,
			razorpaySubscriptionId: razorPaySubscription.id,
			status: "created",
		});

		return res.status(201).json({
			message: "Subscription created",
			subscription,
			name: plan?.name,
			description: plan?.description,
			razorpaySubscriptionId: razorPaySubscription.id,
		});
	} catch (error) {
		console.error("[subscriptionController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to create checkout",
			details: error.message,
		});
	}
};

export const razorpayWebhook = async (req, res) => {
	try {
		const signature = req.headers["x-razorpay-signature"];

		const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

		const data = req.body;
		const generatedSignature = crypto
			.createHmac("sha256", webhookSecret)
			.update(data.toString())
			.digest("hex");

		const isAuthentic = signature === generatedSignature;
		if (!isAuthentic) {
			return res.status(400).json({
				success: false,
				message: "Unauthorsied",
			});
		}

		const body = JSON.parse(req.body.toString());
		const event = body.event;
		const payload = body.payload;

		switch (event) {
			case "order.paid": {
				break;
			}
			case "subscription.charged":
				const subscriptionId = payload.subscription.entity?.id;
				const endAt = payload.subscription?.entity?.current_end * 1000;

				const subscription = await Subscription.findOneAndUpdate(
					{
						razorpaySubscriptionId: subscriptionId,
					},
					{
						status: "active",
						currentPeriodEnd: new Date(endAt),
					},
					{
						returnDocument: "after",
					}
				);

				break;
			default:
				console.log("Unhandled event", event);
		}

		return res.send(200).json({ message: "received" });
	} catch (error) {
		console.error("[razorpayWebhook] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to respond",
			details: error.message,
		});
	}
};
