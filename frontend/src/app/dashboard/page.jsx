"use client";

import React from "react";
import {
	FiDollarSign,
	FiUsers,
	FiActivity,
	FiTrendingUp,
	FiCheckCircle,
	FiServer,
} from "react-icons/fi";
import { Tag } from "antd";

// Mock Data for the Dashboard
const MOCK_STATS = [
	{
		label: "Total Revenue",
		value: "$24,500.00",
		icon: <FiDollarSign size={20} />,
		color: "text-emerald-600",
		bg: "bg-emerald-50",
	},
	{
		label: "Active Subscribers",
		value: "1,204",
		icon: <FiUsers size={20} />,
		color: "text-blue-600",
		bg: "bg-blue-50",
	},
	{
		label: "API Calls (Metered)",
		value: "845k",
		icon: <FiActivity size={20} />,
		color: "text-indigo-600",
		bg: "bg-indigo-50",
	},
	{
		label: "Platform MRR",
		value: "$4,200.50",
		icon: <FiTrendingUp size={20} />,
		color: "text-violet-600",
		bg: "bg-violet-50",
	},
];

const RECENT_WEBHOOKS = [
	{
		id: "evt_1",
		type: "payment_intent.succeeded",
		status: "200 OK",
		time: "2 mins ago",
	},
	{
		id: "evt_2",
		type: "customer.subscription.created",
		status: "200 OK",
		time: "15 mins ago",
	},
	{
		id: "evt_3",
		type: "invoice.payment_failed",
		status: "400 ERR",
		time: "1 hour ago",
		isError: true,
	},
	{
		id: "evt_4",
		type: "checkout.session.completed",
		status: "200 OK",
		time: "2 hours ago",
	},
];

export default function OverviewPage() {
	return (
		<div className="flex flex-col gap-8 pb-10 text-slate-700">
			{/* Welcome Banner */}
			<div className="flex flex-col bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
				<h1 className="text-3xl font-bold text-slate-800 m-0">
					Welcome to the Paypal Masterclass
				</h1>
				<p className="text-lg text-slate-500 mt-2 max-w-3xl">
					This dashboard represents the end-state of our architecture. Over the
					next few modules, we will build the Node.js infrastructure to power
					everything you see here—from one-time payments to complex usage-based
					billing.
				</p>
			</div>

			{/* KPI Stats Row (Flex Wrap) */}
			<div className="flex flex-wrap gap-4">
				{MOCK_STATS.map((stat, idx) => (
					<div
						key={idx}
						className="flex flex-col flex-1 min-w-[240px] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
					>
						<div className="flex justify-between items-start mb-4">
							<span className="text-slate-500 font-medium">{stat.label}</span>
							<div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
								{stat.icon}
							</div>
						</div>
						<span className="text-3xl font-bold text-slate-800">
							{stat.value}
						</span>
					</div>
				))}
			</div>

			{/* Main Content Area: Split into two sections using Flex */}
			<div className="flex flex-col lg:flex-row gap-6">
				{/* Left Column: Curriculum Roadmap */}
				<div className="flex flex-col flex-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
					<div className="flex items-center gap-3 mb-6">
						<div className="bg-blue-100 p-2 rounded-lg text-blue-600">
							<FiCheckCircle size={24} />
						</div>
						<h2 className="text-2xl font-bold text-slate-800 m-0">
							Integration Roadmap
						</h2>
					</div>

					<div className="flex flex-col gap-6">
						<div className="flex gap-4 border-l-2 border-blue-200 pl-4 pb-2">
							<div className="flex flex-col">
								<span className="text-lg font-bold text-slate-800">
									1. One-Time Payments
								</span>
							</div>
						</div>
						<div className="flex gap-4 border-l-2 border-slate-100 pl-4 pb-2 opacity-60">
							<div className="flex flex-col">
								<span className="text-lg font-bold text-slate-800">
									2. SaaS Subscriptions
								</span>
								<span className="text-slate-500 mt-1">
									Customer objects, recurring billing, and the Customer Portal.
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
