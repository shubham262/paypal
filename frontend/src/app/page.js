"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function CourseLandingPage() {
	const router = useRouter();
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 font-sans px-4">
			<div className="text-center max-w-3xl">
				{/* Main Heading */}
				<h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
					Paypal Integrations <br />
					<span className="text-indigo-600">& Implementation</span>
				</h1>

				{/* Brief Subtitle */}
				<p className="text-xl text-slate-600 mb-10">
					Learn how to build production-ready payment systems using Next.js,
					Node.js, and MongoDB.
				</p>

				{/* Get Started Button */}
				<button
					onClick={() => router.push("/signin")}
					className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold py-4 px-10 rounded-lg shadow-md transition-all hover:shadow-lg"
				>
					Get Started
				</button>
			</div>
		</div>
	);
}
