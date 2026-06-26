/* eslint-disable react-hooks/immutability */
"use client";
import React, { useEffect, useRef } from "react";
import { Result, Button } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const CheckoutSuccess = () => {
	const router = useRouter();

	const intervalRef = useRef(null);
	const params = useSearchParams();
	const stripeId = params.get("sessionId");

	useEffect(() => {
		const intervalId = setInterval(() => {
			fetchStatus();
		}, 3000);
		intervalRef.current = intervalId;

		() => {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		};
	}, []);

	const fetchStatus = async () => {
		try {
		} catch (error) {}
	};

	return (
		<div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-6">
			<div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-lg w-full">
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
			</div>
		</div>
	);
};

export default CheckoutSuccess;
