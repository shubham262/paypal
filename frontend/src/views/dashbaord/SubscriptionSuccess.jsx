/* eslint-disable react-hooks/immutability */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Result, Button, message, Spin } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
	capture,
	fetchOrderStatus,
	fetchSubscriptionStatus,
} from "@/service/paypalService";
import { FaLinkedin } from "react-icons/fa";

const CheckoutSuccess = () => {
	const router = useRouter();

	const intervalRef = useRef(null);
	const params = useSearchParams();
	const subscription_id = params.get("subscription_id");

	const [info, setInfo] = useState({
		payment: "loading", //loading, success failed
	});

	useEffect(() => {
		const intervalId = setInterval(() => {
			fetchCapture();
		}, 3000);
		intervalRef.current = intervalId;

		() => {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		};
	}, []);

	const fetchCapture = async () => {
		try {
			const resposne = await fetchSubscriptionStatus(subscription_id);
			const { subscription } = resposne || {};
			if (subscription.status === "active") {
				setInfo((prev) => ({ ...prev, payment: "success" }));
				intervalRef.current = null;
				setTimeout(() => router.push("/dashboard"), 500);
			}
			if (
				subscription.status === "expired" ||
				subscription.status === "past_due" ||
				subscription.status === "canceled"
			) {
				setInfo((prev) => ({ ...prev, payment: "failed" }));
				intervalRef.current = null;
				setTimeout(() => router.push("/dashboard"), 500);
			}
		} catch (error) {
			console.log("error", error);
			message.error("Somethin went worng");
		}
	};

	return (
		<div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-6">
			<div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-lg w-full flex justify-center">
				{info?.payment === "success" ? (
					<Result
						status="success"
						title="Payment Successful!"
						subTitle="Thank you for your purchase. We are processing your enrollment now."
						extra={[
							<Button
								type="primary"
								size="large"
								key="dashboard"
								onClick={() => router.push("/dashboard")}
							>
								Go to My Courses
							</Button>,
						]}
					/>
				) : info?.payment === "loading" ? (
					<Spin size="large" />
				) : (
					<FaLinkedin />
				)}
			</div>
		</div>
	);
};

export default CheckoutSuccess;
