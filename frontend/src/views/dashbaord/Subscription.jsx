/* eslint-disable react-hooks/immutability */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Typography, Switch, message, Divider, Tag } from "antd";
import { FaCheck } from "react-icons/fa";
import { SiPaypal } from "react-icons/si";
import {
	fetchPlans,
	subscribe,
	verifySubscription,
} from "@/service/paypalService";
import PaymentVerifyModal from "@/components/dashboard/PaymentsVerifyModal";

const { Title, Text } = Typography;

const Subscription = () => {
	const [billingInterval, setBillingInterval] = useState("month");
	const [plans, setPlans] = useState([]);
	const [loadingPlanId, setLoadingPlanId] = useState(null);
	const [info, setInfo] = useState({
		isOpen: false,
		status: "verifying", //verifying,success, failed
	});
	useEffect(() => {
		getPlans();
	}, []);

	const handleClose = () => {
		setInfo((prev) => ({ ...prev, isOpen: false, status: "verifying" }));
	};

	const getPlans = useCallback(async () => {
		try {
			const response = await fetchPlans();
			setPlans(response?.plans || []);
		} catch (error) {
			message.error("Something went wrong");
		}
	}, []);

	const handleSubscribe = async (plan) => {
		setLoadingPlanId(plan._id);
		try {
			const payload = {
				planId: plan._id,
				interval: billingInterval,
			};

			const response = await subscribe(payload);
			console.log("response", response);

			message.success(
				`Redirecting to Paypal for ${plan.name} (${billingInterval}ly)...`
			);
		} catch (error) {
			console.error("Subscription failed:", error);
			message.error("Could not initiate checkout.");
		} finally {
			setLoadingPlanId(null);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-6">
			<div className="max-w-5xl mx-auto">
				{/* Header & Toggle Section */}
				<div className="text-center mb-12">
					<Title level={2}>Choose Your Learning Path</Title>
					<Text type="secondary" className="text-lg block mb-8">
						Invest in your career with our flexible subscription plans.
					</Text>

					<div className="flex items-center justify-center gap-4 bg-white inline-flex p-3 rounded-full shadow-sm border border-gray-200">
						<Text
							className={`text-base font-medium ${
								billingInterval === "month" ? "text-blue-600" : "text-gray-500"
							}`}
						>
							Monthly
						</Text>
						<Switch
							checked={billingInterval === "year"}
							onChange={(checked) =>
								setBillingInterval(checked ? "year" : "month")
							}
							className="bg-gray-300 [&.ant-switch-checked]:bg-blue-600"
						/>
						<Text
							className={`text-base font-medium ${
								billingInterval === "year" ? "text-blue-600" : "text-gray-500"
							}`}
						>
							Yearly{" "}
							<Tag color="success" className="ml-1 border-none rounded-full">
								Save 16%
							</Tag>
						</Text>
					</div>
				</div>

				{/* Pricing Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
					{plans.map((plan) => {
						// Find the specific pricing option based on the toggle switch
						const activePricing = plan.pricingOptions.find(
							(opt) => opt.interval === billingInterval
						);
						// Format paise to standard INR
						const formattedPrice = activePricing.price.toLocaleString("en-IN");

						return (
							<Card
								key={plan._id}
								hoverable
								className={`flex flex-col h-full rounded-2xl border-2 transition-all ${
									plan.name === "PW Pro"
										? "border-blue-500 shadow-md transform md:-translate-y-2"
										: "border-gray-200"
								}`}
								bodyStyle={{
									display: "flex",
									flexDirection: "column",
									flexGrow: 1,
									padding: "2rem",
								}}
							>
								{/* Card Header */}
								{plan.name === "PW Pro" && (
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
										<Tag
											color="blue"
											className="px-4 py-1 text-sm font-bold rounded-full m-0 border-none shadow-sm"
										>
											RECOMMENDED
										</Tag>
									</div>
								)}

								<Title level={3} className="!mb-2">
									{plan.name}
								</Title>
								<Text type="secondary" className="h-12 block">
									{plan.description}
								</Text>

								{/* Price Display */}
								<div className="my-6 flex items-baseline gap-1">
									<span className="text-4xl font-extrabold text-gray-900">
										₹{formattedPrice}
									</span>
									<span className="text-gray-500 font-medium text-lg">
										/{billingInterval === "month" ? "mo" : "yr"}
									</span>
								</div>

								<Button
									type={plan.name === "PW Pro" ? "primary" : "default"}
									size="large"
									block
									className={`h-12 text-base font-semibold mb-8 flex items-center justify-center gap-2 ${
										plan.name === "PW Pro"
											? "bg-blue-600 hover:bg-blue-700"
											: ""
									}`}
									onClick={() => handleSubscribe(plan)}
									loading={loadingPlanId === plan._id}
								>
									{plan.name === "PW Pro" ? "Subscribe Now" : "Get Started"}
								</Button>

								<Divider className="my-0 mb-6" />

								{/* Features List */}
								<ul className="space-y-4 mt-auto">
									{plan.features.map((feature, index) => (
										<li key={index} className="flex items-start gap-3">
											<FaCheck className="text-green-500 mt-1 flex-shrink-0" />
											<Text className="text-gray-700">{feature}</Text>
										</li>
									))}
								</ul>
							</Card>
						);
					})}
				</div>

				<p className="text-center text-gray-400 mt-12 flex justify-center items-center gap-2 text-sm">
					<SiPaypal className="text-xl" /> Payments are securely processed by
					Paypal
				</p>
			</div>

			<PaymentVerifyModal
				isOpen={info?.isOpen}
				status={info?.status}
				onClose={handleClose}
			/>
		</div>
	);
};

export default Subscription;
