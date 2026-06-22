"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	FiHome,
	FiShoppingBag,
	FiRepeat,
	FiActivity,
	FiUsers,
	FiShield,
	FiSettings,
	FiCode,
} from "react-icons/fi";
import { authClient } from "@/config/auth";

const NAV_ITEMS = [
	{ name: "Overview", path: "/dashboard", icon: <FiHome size={20} /> },
	{
		name: "One-Time Payments",
		path: "/dashboard/ecommerce",
		icon: <FiShoppingBag size={20} />,
	},
	{
		name: "SaaS Subscriptions",
		path: "/dashboard/subscriptions",
		icon: <FiRepeat size={20} />,
	},
];

export default function SidebarContent() {
	const pathname = usePathname();
	const router = useRouter();
	const handleLogout = useCallback(async () => {
		await authClient.signOut();
		localStorage.clear();
		router.push(`/signin`);
	}, [router]);
	return (
		<div className="flex flex-col h-full bg-white text-slate-700">
			{/* Brand Header */}
			<div className="flex flex-col justify-center h-20 px-6 border-b border-slate-100">
				<div className="flex items-center gap-2 text-blue-600">
					<FiCode size={28} />
					<span className="text-xl font-bold tracking-tight text-slate-800">
						Physics Wallah
					</span>
				</div>
				<span className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">
					Paypal Masterclass
				</span>
			</div>

			{/* Navigation Links */}
			<nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
				<div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
					Modules
				</div>

				{NAV_ITEMS.map((item) => {
					const isActive = pathname === item.path;

					return (
						<Link
							href={item.path}
							key={item.name}
							className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium ${
								isActive
									? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"
									: "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
							}`}
						>
							<div className={isActive ? "text-blue-600" : "text-slate-400"}>
								{item.icon}
							</div>
							{item.name}
						</Link>
					);
				})}
			</nav>

			{/* Bottom Settings Link */}
			<div className="p-4 border-t border-slate-100">
				<div
					onClick={handleLogout}
					className={`cursor-pointer flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium ${
						pathname === "/dashboard/settings"
							? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"
							: "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
					}`}
				>
					<div className="text-slate-400">
						<FiSettings size={20} />
					</div>
					Logout
				</div>
			</div>
		</div>
	);
}
