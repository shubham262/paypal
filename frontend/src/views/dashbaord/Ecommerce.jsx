/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
"use client";
import PaymentVerifyModal from "@/components/dashboard/PaymentsVerifyModal";
import { checkout, fetchProducts, verify } from "@/service/razorpayService";
import { message, Button, Card, Typography, List, Divider, Empty } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import { SiPaypal } from "react-icons/si";

const { Title, Text } = Typography;

const Ecommerce = () => {
	const [info, setInfo] = useState({
		products: [],
		cart: [],
		loadingCheckout: false,
		isOpen: false,
		status: "verifying", //verifying,success, failed
	});

	useEffect(() => {
		getAllProducts();
	}, []);

	const getAllProducts = useCallback(async () => {
		try {
			const { products } = await fetchProducts();
			setInfo((prev) => ({ ...prev, products }));
		} catch (error) {
			console.log("Something went wrong ==> getAllProducts", error);
			message.error(error?.message || "Error fetching products");
		}
	}, []);

	const handleAddToCart = (course) => {
		if (info?.cart.find((item) => item._id === course._id)) {
			message.warning(`${course.name} is already in your cart.`);
			return;
		}

		setInfo((prev) => ({ ...prev, cart: [...prev.cart, course] }));
		message.success(`${course.name} added!`);
	};

	const handleRemoveFromCart = (id) => {
		setInfo((prev) => ({
			...prev,
			cart: prev.cart.filter((item) => item._id !== id),
		}));
	};

	const cartTotalCents = info?.cart.reduce((acc, curr) => acc + curr.price, 0);

	const handleClose = () => {
		setInfo((prev) => ({ ...prev, isOpen: false, status: "verifying" }));
	};

	const handleCheckout = async () => {
		if (info?.cart.length === 0) {
			message.error("Please add at least one course to checkout.");
			return;
		}

		try {
			message.info("Redirecting to Paypal Secure Checkout...");
			const payload = {
				items: [...info?.cart],
			};
			const response = await checkout(payload);
			const { url } = response || {};

			if (url) {
				window.location.href = url;
			} else {
				throw new Error("No redirect URL found in response.");
			}

			setInfo((prev) => ({ ...prev, loadingCheckout: true }));
		} catch (error) {
			console.error("Checkout Failed:", error);
			message.error("Could not initiate checkout.");
		} finally {
			setInfo((prev) => ({ ...prev, loadingCheckout: false }));
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
				{/* Left Side: Course List */}
				<div className="flex-1">
					<div className="mb-6">
						<Title level={2} className="!mb-1">
							Available Courses
						</Title>
						<Text type="secondary">
							Select the programs you want to enroll in.
						</Text>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{info.products.map((course) => (
							<Card
								key={course._id}
								hoverable
								className="flex flex-col justify-between h-full border-gray-200"
								bodyStyle={{
									display: "flex",
									flexDirection: "column",
									flexGrow: 1,
								}}
							>
								<div>
									<Title level={4}>{course.name}</Title>
									<Text type="secondary" className="block mb-4 line-clamp-2">
										{course.description}
									</Text>
								</div>
								<div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
									<Text strong className="text-xl">
										₹{(course.price / 100).toFixed(2)}
									</Text>
									<Button
										type="primary"
										onClick={() => handleAddToCart(course)}
										disabled={info?.cart.some(
											(item) => item._id === course._id
										)}
									>
										{info?.cart.some((item) => item._id === course._id)
											? "In Cart"
											: "Add to Cart"}
									</Button>
								</div>
							</Card>
						))}
					</div>
				</div>

				{/* Right Side: Cart Summary */}
				<div className="w-full lg:w-96">
					<Card className="sticky top-6 shadow-sm border-gray-200 rounded-xl">
						<div className="flex items-center gap-2 mb-4">
							<FaShoppingCart className="text-xl text-gray-700" />
							<Title level={4} className="!m-0">
								Your Cart
							</Title>
						</div>
						<Divider className="my-3" />

						{info?.cart.length === 0 ? (
							<Empty description="Cart is empty" className="my-8" />
						) : (
							<List
								itemLayout="horizontal"
								dataSource={info?.cart}
								renderItem={(item) => (
									<List.Item
										actions={[
											<Button
												key={item?._id}
												type="text"
												danger
												icon={<FaTrash />}
												onClick={() => handleRemoveFromCart(item._id)}
											/>,
										]}
									>
										<List.Item.Meta
											title={item.name}
											description={`$${(item.price / 100).toFixed(2)}`}
										/>
									</List.Item>
								)}
							/>
						)}

						<Divider className="my-4" />

						<div className="flex justify-between items-center mb-6">
							<Text strong className="text-lg">
								Total Due
							</Text>
							<Text strong className="text-2xl text-blue-600">
								₹{(cartTotalCents / 100).toFixed(2)}
							</Text>
						</div>

						<Button
							type="primary"
							size="large"
							block
							icon={<SiPaypal className="text-lg" />}
							className="bg-indigo-600 hover:bg-indigo-700 h-12 text-base flex items-center justify-center gap-2"
							onClick={handleCheckout}
							loading={info?.loadingCheckout}
							disabled={info?.cart.length === 0}
						>
							Checkout with Paypal
						</Button>
						<p className="text-xs text-center text-gray-400 mt-3 flex justify-center items-center gap-1">
							Payments are secure and encrypted.
						</p>
					</Card>
				</div>
			</div>
			<PaymentVerifyModal
				isOpen={info?.isOpen}
				status={info?.status}
				onClose={handleClose}
			/>
		</div>
	);
};

export default Ecommerce;
