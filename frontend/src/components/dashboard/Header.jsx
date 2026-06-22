"use client";

import React from "react";
import { FiMenu } from "react-icons/fi";

export default function Header({ onOpenMobileMenu }) {
	return (
		<header className="flex items-center justify-between h-20 px-4 md:px-8 bg-white border-b border-slate-100 shadow-sm shrink-0 z-10">
			{/* Left side: Mobile menu & Title */}
			<div className="flex items-center gap-4">
				<button
					onClick={onOpenMobileMenu}
					className="p-2 -ml-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg md:hidden transition-colors cursor-pointer"
					aria-label="Open sidebar"
				>
					<FiMenu size={24} />
				</button>

				<div className="flex flex-col">
					<h1 className="text-xl font-bold text-slate-800 m-0 hidden sm:block">
						Payment Infrastructure
					</h1>
					<span className="text-sm text-slate-500 hidden sm:block">
						Test Environment (Node.js Backend)
					</span>
				</div>
			</div>
		</header>
	);
}
