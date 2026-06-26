import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
	{
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
			trim: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
		},
		unitAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		lineTotal: {
			type: Number,
			required: true,
			min: 0,
		},
		currency: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ _id: false }
);

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			index: true,
		},
		items: {
			type: [orderItemSchema],
			default: [],
			required: true,
		},
		subtotalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		currency: {
			type: String,
			required: true,
			default: "inr",
			trim: true,
		},
		status: {
			type: String,
			enum: ["pending", "paid", "failed", "canceled"],
			default: "pending",
			index: true,
		},

		paypalOrderId: {
			type: String,
			unique: true,
			sparse: true,
			required: true,
		},
		paypalOrderStatus: {
			type: String,
		},
		paidAt: {
			type: Date,
		},
	},
	{ timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
